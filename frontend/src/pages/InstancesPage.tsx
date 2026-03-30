import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { instanceService, teamService, type Instance, type Team } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, ExternalLink, Pencil, Plus, Server, Trash2, X } from 'lucide-react'

type ApiErr = { response?: { data?: { error?: string } } }

const EMPTY_FORM = { name: '', url: '', appName: '' }

export default function InstancesPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { hasPrivilege } = useAuth()
  const canManageInstances = hasPrivilege('canManageInstances')

  const [team, setTeam] = useState<Team | null>(null)
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)
  const [denied, setDenied] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Instance | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Instance | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchData = async () => {
    if (!teamId) return
    setLoading(true)
    try {
      const [fetchedTeam, fetchedInstances] = await Promise.all([
        canManageInstances ? teamService.getById(teamId) : Promise.resolve(null),
        instanceService.getAllByTeam(teamId),
      ])
      setTeam(fetchedTeam)
      setInstances(fetchedInstances)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 403) {
        setDenied(true)
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load instances' })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [teamId]) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setCreateOpen(true)
  }

  const openEdit = (instance: Instance) => {
    setEditTarget(instance)
    setForm({ name: instance.name, url: instance.url, appName: instance.appName })
  }

  const handleCreate = async () => {
    if (!teamId) return
    setSaving(true)
    try {
      const instance = await instanceService.create({ teamId, ...form })
      setInstances((prev) => [...prev, instance])
      setCreateOpen(false)
      toast({ title: 'Instance created' })
    } catch (err: unknown) {
      const msg = (err as ApiErr)?.response?.data?.error ?? 'Failed to create instance'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editTarget) return
    setSaving(true)
    try {
      const updated = await instanceService.update(editTarget.id, form)
      setInstances((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      setEditTarget(null)
      toast({ title: 'Instance updated' })
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
      await instanceService.delete(deleteTarget.id)
      setInstances((prev) => prev.filter((i) => i.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast({ title: 'Instance deleted' })
    } catch (err: unknown) {
      const msg = (err as ApiErr)?.response?.data?.error ?? 'Delete failed'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setDeleting(false)
    }
  }

  const renderFormFields = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="inst-name">Name <span className="text-xs text-muted-foreground">(max 50 chars)</span></Label>
        <Input
          id="inst-name"
          value={form.name}
          maxLength={50}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Production"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inst-url">URL</Label>
        <Input
          id="inst-url"
          value={form.url}
          onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
          placeholder="https://example.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="inst-appname">App name <span className="text-xs text-muted-foreground">(max 30 chars)</span></Label>
        <Input
          id="inst-appname"
          value={form.appName}
          maxLength={30}
          onChange={(e) => setForm((f) => ({ ...f, appName: e.target.value }))}
          placeholder="e.g. my-app"
        />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-36 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (denied) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Server className="mx-auto h-12 w-12 mb-3 opacity-40" />
        <p className="font-medium">Access denied</p>
        <p className="text-sm mt-1">You are not a member of this team.</p>
        <Button variant="link" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(canManageInstances ? `/teams/${teamId}` : -1 as unknown as string)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {canManageInstances && team ? team.title : 'Back'}
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Server className="h-7 w-7 text-primary shrink-0 mt-0.5" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Instances</h1>
            {team && (
              <p className="text-muted-foreground text-sm mt-1">{team.title}</p>
            )}
          </div>
        </div>
        {canManageInstances && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" /> New instance
          </Button>
        )}
      </div>

      {/* Instance grid */}
      {instances.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Server className="mx-auto h-12 w-12 mb-3 opacity-40" />
          <p>No instances yet{canManageInstances ? '. Create one to get started.' : '.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map((instance) => (
            <Card key={instance.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-2">
                  <Server className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <CardTitle className="text-base leading-tight">{instance.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{instance.appName}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 mt-auto">
                <a
                  href={instance.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{instance.url}</span>
                </a>
                {canManageInstances && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => openEdit(instance)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteTarget(instance)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Create Dialog ────────────────────────────────────────────────── */}
      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Create instance</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            {renderFormFields()}
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={saving}>Cancel</Button>
              </Dialog.Close>
              <Button disabled={saving || !form.name || !form.url || !form.appName} onClick={handleCreate}>
                {saving ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Edit Dialog ──────────────────────────────────────────────────── */}
      <Dialog.Root open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Edit instance</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            {renderFormFields()}
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={saving}>Cancel</Button>
              </Dialog.Close>
              <Button disabled={saving || !form.name || !form.url || !form.appName} onClick={handleEdit}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Delete Confirm Dialog ────────────────────────────────────────── */}
      <Dialog.Root open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Delete instance</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={deleting}>Cancel</Button>
              </Dialog.Close>
              <Button variant="destructive" disabled={deleting} onClick={handleDelete}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
