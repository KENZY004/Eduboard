const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  blacklistToken,
  isBlacklisted,
  cleanupExpired,
  stopCleanup,
  size,
} = require("./services/tokenBlacklist");
const { verifyToken, extractBearerToken } = require("./utils/auth");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

describe("Token Blacklist Service Unit Tests", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    stopCleanup();
  });

  test("should successfully blacklist a token with jti claim", () => {
    const jti = crypto.randomUUID();
    const exp = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const decoded = { id: "user123", jti, exp };
    const rawToken = "dummy-raw-token-1";

    blacklistToken(decoded, rawToken);

    expect(isBlacklisted(decoded, rawToken)).toBe(true);
  });

  test("should handle fallback SHA-256 hash if jti claim is missing (but sub + iat exist)", () => {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 3600;
    const decoded = { sub: "user456", iat, exp };
    const rawToken = "dummy-raw-token-2";

    blacklistToken(decoded, rawToken);

    expect(isBlacklisted(decoded, rawToken)).toBe(true);
  });

  test("should fallback to raw token SHA-256 if both jti and sub/iat are missing", () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const decoded = { exp };
    const rawToken = "dummy-raw-token-3";

    blacklistToken(decoded, rawToken);

    expect(isBlacklisted(decoded, rawToken)).toBe(true);
  });

  test("should identify non-blacklisted tokens", () => {
    const decoded = { id: "user789", jti: crypto.randomUUID(), exp: Math.floor(Date.now() / 1000) + 3600 };
    const rawToken = "dummy-raw-token-4";

    expect(isBlacklisted(decoded, rawToken)).toBe(false);
  });

  test("should automatically clear expired tokens on cleanup", () => {
    const originalNow = Date.now;
    try {
      const jti = crypto.randomUUID();
      const exp = Math.floor(Date.now() / 1000) + 10; // Expires in 10s
      const decoded = { id: "user_exp", jti, exp };
      const rawToken = "dummy-exp-token";

      blacklistToken(decoded, rawToken);
      expect(isBlacklisted(decoded, rawToken)).toBe(true);

      // Mock Date.now to simulate 15 seconds in the future (token expired)
      Date.now = () => (exp + 5) * 1000;

      // Executing manual cleanup
      cleanupExpired();

      // Should be removed
      expect(isBlacklisted(decoded, rawToken)).toBe(false);
    } finally {
      Date.now = originalNow;
    }
  });

  test("isBlacklisted should double check and delete entry if past its expiry even if cleanup hasn't run", () => {
    const originalNow = Date.now;
    try {
      const jti = crypto.randomUUID();
      const exp = Math.floor(Date.now() / 1000) + 10; // Expires in 10s
      const decoded = { id: "user_lazy", jti, exp };
      const rawToken = "dummy-lazy-token";

      blacklistToken(decoded, rawToken);
      expect(isBlacklisted(decoded, rawToken)).toBe(true);

      // Mock Date.now to be after exp
      Date.now = () => (exp + 5) * 1000;

      // isBlacklisted should detect expiration and clean up, returning false
      expect(isBlacklisted(decoded, rawToken)).toBe(false);
    } finally {
      Date.now = originalNow;
    }
  });
});

describe("verifyToken Middleware Integration Tests", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.restoreAllMocks();
  });

  afterAll(() => {
    stopCleanup();
  });

  test("should call next() and populate req.user for a valid non-blacklisted token", () => {
    const jti = crypto.randomUUID();
    const token = jwt.sign({ id: "user123", jti }, JWT_SECRET, { expiresIn: "1h" });
    req.headers.authorization = `Bearer ${token}`;

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe("user123");
    expect(req.user.jti).toBe(jti);
  });

  test("should return 401 and deny access if Authorization header is missing", () => {
    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided. Access denied." });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 and deny access if Authorization header is malformed", () => {
    req.headers.authorization = "InvalidFormat abc123xyz";

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No token provided. Access denied." });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if token is expired", () => {
    const token = jwt.sign(
      { id: "user123", iat: Math.floor(Date.now() / 1000) - 7200 },
      JWT_SECRET,
      { expiresIn: "-1h" }
    );
    req.headers.authorization = `Bearer ${token}`;

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token has expired. Please log in again." });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if token is invalid (signature failure)", () => {
    const token = jwt.sign({ id: "user123" }, "wrongsecret", { expiresIn: "1h" });
    req.headers.authorization = `Bearer ${token}`;

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token. Access denied." });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 if token is blacklisted", () => {
    const jti = crypto.randomUUID();
    const token = jwt.sign({ id: "user123", jti }, JWT_SECRET, { expiresIn: "1h" });
    req.headers.authorization = `Bearer ${token}`;

    const decoded = jwt.verify(token, JWT_SECRET);
    blacklistToken(decoded, token);

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Token has been invalidated. Please log in again.",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
