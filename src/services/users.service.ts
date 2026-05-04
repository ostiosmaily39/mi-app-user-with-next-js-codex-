import { USERS_API_URL } from "@/lib/api";
import type { ApiResponse, User, UserPayload } from "@/types/user";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      body?.message ?? `La API respondio con estado ${response.status}.`,
    );
  }

  // La API devuelve un contenedor con success y data.
  // Aqui extraemos solamente data para que los componentes reciban datos limpios.
  if (body && typeof body === "object" && "success" in body) {
    const apiBody = body as ApiResponse<T>;

    if (!apiBody.success) {
      throw new Error(apiBody.message ?? "La operacion no fue exitosa.");
    }

    return apiBody.data;
  }

  return body as T;
}

// Servicio centralizado del recurso Usuarios.
// Asi los componentes no conocen URLs ni metodos HTTP directamente.
export const usersService = {
  // GET /api/users
  getAll() {
    return request<User[]>(USERS_API_URL);
  },

  // GET /api/users/:id
  getById(id: number) {
    return request<User>(`${USERS_API_URL}/${id}`);
  },

  // POST /api/users
  create(payload: UserPayload) {
    return request<User>(USERS_API_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // PUT /api/users/:id
  update(id: number, payload: UserPayload) {
    return request<User>(`${USERS_API_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  // DELETE /api/users/:id
  delete(id: number) {
    return request<unknown>(`${USERS_API_URL}/${id}`, {
      method: "DELETE",
    });
  },
};