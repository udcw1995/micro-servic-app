import { useEffect, useRef, useState } from 'react'
import { authService, roleService, uploadService, userService, type Role, type User } from '@/api'
import { useToast } from '@/context/use-toast'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Dialog from '@radix-ui/react-dialog'
import { Camera, Pencil, Plus, Trash2, UserCircle2, X } from 'lucide-react'

export default function UsersPage() {
  const { toast } = useToast()
  const { user: me, logout, isAdmin, updateUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '', roleId: '' })
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editConfirmOpen, setEditConfirmOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ firstName: '', lastName: '', email: '', password: '', roleId: '' })
  const [creating, setCreating] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getAll()
      setUsers(data)
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load users' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    if (isAdmin) roleService.getAll().then(setRoles).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = (u: User) => {
    setEditTarget(u)
    setEditForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, roleId: u.roleId ?? '' })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editTarget) return
    if (avatarInputRef.current) avatarInputRef.current.value = ''
    setUploadingAvatar(true)
    try {
      const { url } = await uploadService.uploadAvatar(file, editTarget.id)
      const updated = await userService.update(editTarget.id, { avatarUrl: url })
      setEditTarget(updated)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      if (me?.id === editTarget.id) updateUser({ avatarUrl: url })
      toast({ title: 'Photo updated' })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Upload failed'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!editTarget) return
    setUploadingAvatar(true)
    try {
      // Only call upload-service delete when removing own avatar (JWT identifies caller)
      if (me?.id === editTarget.id) await uploadService.deleteAvatar()
      const updated = await userService.update(editTarget.id, { avatarUrl: null })
      setEditTarget(updated)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      if (me?.id === editTarget.id) updateUser({ avatarUrl: null })
      toast({ title: 'Photo removed' })
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to remove photo' })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCreateForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleCreateSave = async () => {
    setCreating(true)
    try {
      const newUser = await authService.register({
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
      })
      if (createForm.roleId) {
        await userService.update(newUser.id, { roleId: createForm.roleId })
      }
      await fetchUsers()
      setCreateOpen(false)
      setCreateForm({ firstName: '', lastName: '', email: '', password: '', roleId: '' })
      toast({ title: 'User created' })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to create user'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setCreating(false)
    }
  }

  const handleEditSave = async () => {
    if (!editTarget) return
    setSaving(true)
    try {
      const payload: { firstName: string; lastName: string; email: string; roleId?: string | null } = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        email: editForm.email,
      }
      if (isAdmin) payload.roleId = editForm.roleId || null
      const updated = await userService.update(editTarget.id, payload)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
      setEditTarget(null)
      toast({ title: 'User updated' })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Update failed'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await userService.delete(deleteTarget.id)
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id))
      toast({ title: 'User deleted' })
      if (me?.id === deleteTarget.id) logout()
      setDeleteTarget(null)
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Delete failed' })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} {users.length === 1 ? 'user' : 'users'} registered
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add User
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <UserCircle2 className="mx-auto h-12 w-12 mb-3 opacity-40" />
          <p>No users found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <Card key={u.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt={`${u.firstName} ${u.lastName}`}
                        className="h-10 w-10 rounded-full object-cover shrink-0 border"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base leading-tight">
                        {u.firstName} {u.lastName}
                        {me?.id === u.id && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground truncate max-w-45">{u.email}</p>
                      {u.role && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize mt-1">
                          {u.role.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              {(isAdmin || me?.id === u.id) && (
                <CardContent className="flex gap-2 pt-0">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(u)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => setDeleteTarget(u)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog.Root open={createOpen} onOpenChange={(open) => { if (!open) { setCreateOpen(false); setCreateForm({ firstName: '', lastName: '', email: '', password: '', roleId: '' }) } }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Add user</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="create-firstName">First name</Label>
                  <Input
                    id="create-firstName"
                    name="firstName"
                    value={createForm.firstName}
                    onChange={handleCreateChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-lastName">Last name</Label>
                  <Input
                    id="create-lastName"
                    name="lastName"
                    value={createForm.lastName}
                    onChange={handleCreateChange}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  name="email"
                  type="email"
                  value={createForm.email}
                  onChange={handleCreateChange}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  name="password"
                  type="password"
                  value={createForm.password}
                  onChange={handleCreateChange}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-role">Role</Label>
                <Select
                  id="create-role"
                  value={createForm.roleId}
                  onChange={(e) => setCreateForm((f) => ({ ...f, roleId: e.target.value }))}
                >
                  <option value="">Default (user)</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button className="flex-1" disabled={creating} onClick={handleCreateSave}>
                {creating ? 'Creating…' : 'Create user'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit Dialog */}
      <Dialog.Root open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Edit user</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Avatar section */}
            <div className="flex items-center gap-4 pb-2 border-b">
              {editTarget?.avatarUrl ? (
                <img
                  src={editTarget.avatarUrl}
                  alt="avatar"
                  className="h-16 w-16 rounded-full object-cover border shrink-0"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                  {editTarget?.firstName?.[0]}{editTarget?.lastName?.[0]}
                </div>
              )}
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Profile photo</p>
                <div className="flex gap-2">
                  <label htmlFor="edit-avatar" className="cursor-pointer">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={uploadingAvatar}
                      asChild
                    >
                      <span>
                        <Camera className="h-3.5 w-3.5 mr-1" />
                        {uploadingAvatar ? 'Uploading…' : 'Upload photo'}
                      </span>
                    </Button>
                    <input
                      ref={avatarInputRef}
                      id="edit-avatar"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="sr-only"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </label>
                  {editTarget?.avatarUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={uploadingAvatar}
                      onClick={handleAvatarDelete}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">JPEG, PNG, GIF or WebP · max 5 MB</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-firstName">First name</Label>
                  <Input
                    id="edit-firstName"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-lastName">Last name</Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                />
              </div>
              {isAdmin && (
                <div className="space-y-1.5">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    id="edit-role"
                    value={editForm.roleId}
                    onChange={(e) => setEditForm((f) => ({ ...f, roleId: e.target.value }))}
                  >
                    <option value="">No role</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </Select>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button className="flex-1" disabled={saving} onClick={() => setEditConfirmOpen(true)}>
                Save changes
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete User Confirm Dialog */}
      <Dialog.Root open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold">Delete user</Dialog.Title>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{deleteTarget?.firstName} {deleteTarget?.lastName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1" disabled={deleting}>Cancel</Button>
              </Dialog.Close>
              <Button variant="destructive" className="flex-1" disabled={deleting} onClick={handleDelete}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit User Confirm Dialog */}
      <Dialog.Root open={editConfirmOpen} onOpenChange={setEditConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-60 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold">Save changes?</Dialog.Title>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to update <strong>{editTarget?.firstName} {editTarget?.lastName}</strong>?
            </p>
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1" disabled={saving}>Cancel</Button>
              </Dialog.Close>
              <Button className="flex-1" disabled={saving} onClick={() => { setEditConfirmOpen(false); handleEditSave() }}>
                {saving ? 'Saving…' : 'Confirm'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
