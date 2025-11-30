// Lightweight in-browser API that uses localStorage instead of a backend.
// This replaces previous fetch/remote calls so the app works without MongoDB.

const STORAGE_KEYS = {
  users: "fedf_users_v1",
  projects: "fedf_projects_v1"
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const read = (key) => {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
};

const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const sanitizeUser = (u) => {
  const { password, ...rest } = u || {};
  return rest;
};

const getUserFromToken = (token) => {
  if (!token) return null;
  // token is simply the user _id in this local implementation
  const users = read(STORAGE_KEYS.users);
  return users.find((u) => u._id === token) || null;
};

export const apiRequest = async (path, method = "GET", body = null, token = null) => {
  // small artificial delay to mimic network
  await wait(120);

  // normalize path and id extraction
  const parts = path.split("?")[0].split("/").filter(Boolean);

  try {
    // AUTH: register
    if (parts[0] === "auth" && parts[1] === "register" && method === "POST") {
      const users = read(STORAGE_KEYS.users);
      if (users.find((u) => u.email === body.email)) {
        throw new Error("Email already registered");
      }
      const newUser = {
        _id: makeId(),
        name: body.name,
        email: body.email,
        role: body.role || "student",
        password: body.password // stored in plain text for local dev only
      };
      users.push(newUser);
      write(STORAGE_KEYS.users, users);
      const tokenOut = newUser._id;
      return { token: tokenOut, ...sanitizeUser(newUser) };
    }

    // AUTH: login
    if (parts[0] === "auth" && parts[1] === "login" && method === "POST") {
      const users = read(STORAGE_KEYS.users);
      const u = users.find((x) => x.email === body.email && x.password === body.password);
      if (!u) throw new Error("Invalid credentials");
      const tokenOut = u._id;
      return { token: tokenOut, ...sanitizeUser(u) };
    }

    // USERS
    if (parts[0] === "users") {
      const users = read(STORAGE_KEYS.users);
      // GET /users
      if (parts.length === 1 && method === "GET") {
        return users.map(sanitizeUser);
      }

      // PUT /users/:id
      if (parts.length === 2 && method === "PUT") {
        const id = parts[1];
        const idx = users.findIndex((u) => u._id === id);
        if (idx === -1) throw new Error("User not found");
        users[idx] = { ...users[idx], ...body };
        write(STORAGE_KEYS.users, users);
        return sanitizeUser(users[idx]);
      }

      // DELETE /users/:id
      if (parts.length === 2 && method === "DELETE") {
        const id = parts[1];
        const filtered = users.filter((u) => u._id !== id);
        write(STORAGE_KEYS.users, filtered);
        return { success: true };
      }
    }

    // PROJECTS
    if (parts[0] === "projects") {
      const projects = read(STORAGE_KEYS.projects);
      const currentUser = getUserFromToken(token);

      // GET /projects - return all for admin, else only owner's
      if (parts.length === 1 && method === "GET") {
        if (currentUser && currentUser.role === "admin") {
          return projects;
        }
        if (currentUser) return projects.filter((p) => p.owner?._id === currentUser._id);
        return []; // unauthenticated -> none
      }

      // POST /projects - create
      if (parts.length === 1 && method === "POST") {
        if (!currentUser) throw new Error("Unauthorized");
        const newP = {
          _id: makeId(),
          ...body,
          owner: sanitizeUser(currentUser),
          status: "pending",
          createdAt: new Date().toISOString(),
          milestones: body.milestones || []
        };
        projects.unshift(newP);
        write(STORAGE_KEYS.projects, projects);
        return newP;
      }

      // PUT /projects/:id - update
      if (parts.length === 2 && method === "PUT") {
        const id = parts[1];
        const idx = projects.findIndex((p) => p._id === id);
        if (idx === -1) throw new Error("Project not found");
        const proj = projects[idx];
        // only owner or admin can update
        if (!currentUser) throw new Error("Unauthorized");
        if (proj.owner?._id !== currentUser._id && currentUser.role !== "admin") throw new Error("Forbidden");
        projects[idx] = { ...proj, ...body };
        write(STORAGE_KEYS.projects, projects);
        return projects[idx];
      }

      // DELETE /projects/:id
      if (parts.length === 2 && method === "DELETE") {
        const id = parts[1];
        const proj = projects.find((p) => p._id === id);
        if (!proj) throw new Error("Project not found");
        const currentUser2 = getUserFromToken(token);
        if (!currentUser2) throw new Error("Unauthorized");
        if (proj.owner?._id !== currentUser2._id && currentUser2.role !== "admin") throw new Error("Forbidden");
        const filtered = projects.filter((p) => p._id !== id);
        write(STORAGE_KEYS.projects, filtered);
        return { success: true };
      }

      // PATCH /projects/:id/review - admin review action
      if (parts.length === 3 && parts[2] === "review" && method === "PATCH") {
        const id = parts[1];
        const proj = projects.find((p) => p._id === id);
        if (!proj) throw new Error("Project not found");
        const acting = getUserFromToken(token);
        if (!acting || acting.role !== "admin") throw new Error("Forbidden");
        proj.status = body.status || proj.status;
        proj.feedback = body.feedback || proj.feedback;
        write(STORAGE_KEYS.projects, projects);
        return proj;
      }
    }

    throw new Error("Endpoint not implemented: " + path);
  } catch (err) {
    // mirror server error behavior
    throw new Error(err.message || "Request failed");
  }
};
