"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "@/lib/api";
import { usersService } from "@/services/users.service";
import type { User, UserPayload } from "@/types/user";

type SaveResult = {
  ok: boolean;
  message: string;
};

// Hook personalizado que concentra toda la logica del CRUD.
// La pantalla solo consume datos y funciones, sin preocuparse por fetch ni estados internos.
export function useUsers() {
  // Estados principales de datos, seleccion, carga, guardado y mensajes visuales.
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // useMemo evita ordenar de nuevo la lista en cada render si users no cambio.
  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.id - b.id),
    [users],
  );

  // useCallback mantiene estable la referencia de loadUsers para usarla en efectos y props.
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carga inicial de usuarios cuando la pagina se monta.
  // El setTimeout evita una regla estricta del linter de React sobre setState directo en efectos.
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadUsers]);

  // Si hay usuario seleccionado se actualiza; si no, se crea uno nuevo.
  async function saveUser(payload: UserPayload): Promise<SaveResult> {
    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      const savedUser = selectedUser
        ? await usersService.update(selectedUser.id, payload)
        : await usersService.create(payload);

      setUsers((currentUsers) => {
        // Actualizamos el estado local sin volver a pedir toda la lista a la API.
        const exists = currentUsers.some((user) => user.id === savedUser.id);

        if (!exists) {
          return [...currentUsers, savedUser];
        }

        return currentUsers.map((user) =>
          user.id === savedUser.id ? savedUser : user,
        );
      });

      setSelectedUser(null);
      setNotice(
        selectedUser ? "Usuario actualizado." : "Usuario creado correctamente.",
      );

      return { ok: true, message: "Guardado correctamente." };
    } catch (caughtError) {
      const message = getApiErrorMessage(caughtError);
      setError(message);
      return { ok: false, message };
    } finally {
      setIsSaving(false);
    }
  }

  // Elimina un usuario despues de confirmar la accion con el usuario.
  async function deleteUser(id: number) {
    const shouldDelete = window.confirm(
      "Estas seguro de que quieres eliminar este usuario?",
    );

    if (!shouldDelete) {
      return;
    }

    setError(null);
    setNotice(null);

    try {
      await usersService.delete(id);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));

      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }

      setNotice("Usuario eliminado.");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError));
    }
  }

  // Todo lo retornado aqui queda disponible para la pagina y sus componentes hijos.
  return {
    users: sortedUsers,
    selectedUser,
    isLoading,
    isSaving,
    error,
    notice,
    loadUsers,
    saveUser,
    deleteUser,
    editUser: setSelectedUser,
    cancelEdit: () => setSelectedUser(null),
    clearNotice: () => setNotice(null),
  };
}   