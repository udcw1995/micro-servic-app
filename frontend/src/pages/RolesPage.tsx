import { useEffect, useState } from 'react'
import { roleService, type Role } from '@/api'
import { useToast } from '@/context/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Dialog from '@radix-ui/react-dialog'
import { Pencil, Plus, ShieldCheck, Trash2, X } from 'lucide-react'

type PrivEntry = { key: string; value: boolean }

function toEntries(obj: Record<string, boolean>): PrivEntry[] {
  return Object.entries(obj).map(([key, value]) => ({ key, value }))
}

function fromEntries(entries: PrivEntry[]): Record<string, boolean> {
  return Object.fromEntries(entries.map((e) => [e.key.trim(), e.value]))
}

const EMPTY_FORM = { name: '', privEntries: [] as PrivEntry[] }

type ApiErr = { response?: { data?: { error?: string } } }

export default function RolesPage() {
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Role | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editConfirmOpen, setEditConfirmOpen] = useState(false)

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setRoles(await roleService.getAll())
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load roles' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRoles() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setCreateOpen(true)
  }

  const openEdit = (role: Role) => {
    setEditTarget(role)
    setForm({ name: role.name, privEntries: toEntries(role.privileges) })
  }

  // ── Privilege entry helpers ──────────────────────────────────────────────
  const addPriv = () =>
    setForm((f) => ({ ...f, privEntries: [...f.privEntries, { key: '', value: false }] }))

  const updatePrivKey = (i: number, key: string) =>
    setForm((f) => ({
      ...f,
      privEntries: f.privEntries.map((e, idx) => (idx === i ? { ...e, key } : e)),
    }))

  const updatePrivValue = (i: number, value: boolean) =>
    setForm((f) => ({
      ...f,
      privEntries: f.privEntries.map((e, idx) => (idx === i ? { ...e, value } : e)),
    }))

  const removePriv = (i: number) =>
    setForm((f) => ({ ...f, privEntries: f.privEntries.filter((_, idx) => idx !== i) }))

  // ── CRUD handlers ────────────────────────────────────────────────────────
  const handleCreate = async () => {
    setSaving(true)
    try {
      const role = await roleService.create({ name: form.name, privileges: fromEntries(form.privEntries) })
      setRoles((prev) => [...prev, role])
      setCreateOpen(false)
      toast({ title: 'Role created' })
    } catch (err: unknown) {
      const msg = (err as ApiErr)?.response?.data?.error ?? 'Failed to create role'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editTarget) return
    setSaving(true)
    try {
      const role = await roleService.update(editTarget.id, { name: form.name, privileges: fromEntries(form.privEntries) })
      setRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)))
      setEditTarget(null)
      toast({ title: 'Role updated' })
    } catch (err: unknown) {
      const msg = (err as ApiErr)?.response?.data?.error ?? 'Update failed'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await roleService.delete(deleteTarget.id)
      setRoles((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast({ title: 'Role deleted' })
    } catch (err: unknown) {
      const msg = (err as ApiErr)?.response?.data?.error ?? 'Delete failed'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setDeleting(false)
    }
  }

  // ── Shared form body ─────────────────────────────────────────────────────
  const renderFormBody = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="role-name">Role name</Label>
        <Input
          id="role-name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. moderator"
        />
      </div>
      <div className="space-y-2">
        <Label>Privileges</Label>
        {form.privEntries.length === 0 && (
          <p className="text-xs text-muted-foreground">No privileges defined.</p>
        )}
        {form.privEntries.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder="privilege name"
              value={entry.key}
              onChange={(e) => updatePrivKey(i, e.target.value)}
              className="flex-1"
            />
            <label className="flex items-center gap-1.5 text-sm whitespace-nowrap cursor-pointer">
              <input
                type="checkbox"
                checked={entry.value}
                onChange={(e) => updatePrivValue(i, e.target.checked)}
                className="h-4 w-4 rounded border-input cursor-pointer"
              />
              Enabled
            </label>
            <button
              type="button"
              onClick={() => removePriv(i)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addPriv}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add privilege
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {roles.length} {roles.length === 1 ? 'role' : 'roles'} defined
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> New role
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShieldCheck className="mx-auto h-12 w-12 mb-3 opacity-40" />
          <p>No roles found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                  <CardTitle className="text-base capitalize">{role.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  {Object.entries(role.privileges).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No privileges</p>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(role.privileges).map(([key, val]) => (
                        <span
                          key={key}
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            val
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-muted text-muted-foreground line-through'
                          }`}
                        >
                          {key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(role)}>
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1" onClick={() => setDeleteTarget(role)}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Create Dialog ──────────────────────────────────────────────── */}
      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-lg border shadow-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Create role</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </Dialog.Close>
            </div>
            {renderFormBody()}
            <div className="flex gap-3 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button className="flex-1" disabled={saving} onClick={handleCreate}>
                {saving ? 'Creating…' : 'Create role'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Edit Dialog ────────────────────────────────────────────────── */}
      <Dialog.Root open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-lg border shadow-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Edit role</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </Dialog.Close>
            </div>
            {renderFormBody()}
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

      {/* ── Edit Confirm Dialog ─────────────────────────────────────────── */}
      <Dialog.Root open={editConfirmOpen} onOpenChange={setEditConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-60 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold">Save changes?</Dialog.Title>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to update the <strong>{editTarget?.name}</strong> role?
            </p>
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1" disabled={saving}>Cancel</Button>
              </Dialog.Close>
              <Button className="flex-1" disabled={saving} onClick={() => { setEditConfirmOpen(false); handleEdit() }}>
                {saving ? 'Saving…' : 'Confirm'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Delete Confirm Dialog ──────────────────────────────────────── */}
      <Dialog.Root open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold">Delete role</Dialog.Title>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete the <strong>{deleteTarget?.name}</strong> role?
              Users currently assigned this role will have their role set to null.
            </p>
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <Button variant="outline" className="flex-1">Cancel</Button>
              </Dialog.Close>
              <Button variant="destructive" className="flex-1" disabled={deleting} onClick={handleDelete}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
