import { useEffect, useState } from 'react'
import { userService, type User } from '@/api'
import { useToast } from '@/context/use-toast'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Dialog from '@radix-ui/react-dialog'
import { Pencil, Trash2, UserCircle2, X } from 'lucide-react'

export default function UsersPage() {
  const { toast } = useToast()
  const { user: me, logout } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  useEffect(() => { fetchUsers() }, [])

  const openEdit = (u: User) => {
    setEditTarget(u)
    setEditForm({ firstName: u.firstName, lastName: u.lastName, email: u.email })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleEditSave = async () => {
    if (!editTarget) return
    setSaving(true)
    try {
      const updated = await userService.update(editTarget.id, editForm)
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

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await userService.delete(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast({ title: 'User deleted' })
      if (me?.id === id) logout()
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Delete failed' })
    } finally {
      setDeletingId(null)
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
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">
                        {u.firstName} {u.lastName}
                        {me?.id === u.id && (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>
                        )}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground truncate max-w-[180px]">{u.email}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex gap-2 pt-0">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(u)}>
                  <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  disabled={deletingId === u.id}
                  onClick={() => handleDelete(u.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  {deletingId === u.id ? 'Deleting…' : 'Delete'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            </div>
            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button className="flex-1" disabled={saving} onClick={handleEditSave}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
