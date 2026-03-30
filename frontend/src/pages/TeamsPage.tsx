import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { teamService, type Team } from '@/api'
import { useToast } from '@/context/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Dialog from '@radix-ui/react-dialog'
import { Layers, Pencil, Plus, Trash2, Users, X } from 'lucide-react'

type ApiErr = { response?: { data?: { error?: string } } }

const EMPTY_FORM = { title: '', description: '' }

export default function TeamsPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Team | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editConfirmOpen, setEditConfirmOpen] = useState(false)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      setTeams(await teamService.getAll())
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load teams' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTeams() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setCreateOpen(true)
  }

  const openEdit = (team: Team) => {
    setEditTarget(team)
    setForm({ title: team.title, description: team.description ?? '' })
  }

  const handleCreate = async () => {
    setSaving(true)
    try {
      const team = await teamService.create({ title: form.title, description: form.description || undefined })
      setTeams((prev) => [...prev, team])
      setCreateOpen(false)
      toast({ title: 'Team created' })
    } catch (err: unknown) {
      const msg = (err as ApiErr)?.response?.data?.error ?? 'Failed to create team'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!editTarget) return
    setSaving(true)
    try {
      const team = await teamService.update(editTarget.id, {
        title: form.title,
        description: form.description || undefined,
      })
      setTeams((prev) => prev.map((t) => (t.id === team.id ? team : t)))
      setEditTarget(null)
      toast({ title: 'Team updated' })
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
      await teamService.delete(deleteTarget.id)
      setTeams((prev) => prev.filter((t) => t.id !== deleteTarget.id))
      setDeleteTarget(null)
      toast({ title: 'Team deleted' })
    } catch (err: unknown) {
      const msg = (err as ApiErr)?.response?.data?.error ?? 'Delete failed'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setDeleting(false)
    }
  }

  const renderFormBody = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="team-title">Team name</Label>
        <Input
          id="team-title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="e.g. Backend Squad"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="team-description">Description <span className="text-muted-foreground">(optional)</span></Label>
        <Input
          id="team-description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="What does this team work on?"
        />
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {teams.length} {teams.length === 1 ? 'team' : 'teams'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> New team
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Layers className="mx-auto h-12 w-12 mb-3 opacity-40" />
          <p>No teams yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start gap-2">
                  <Layers className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <CardTitle className="text-base leading-tight">{team.title}</CardTitle>
                    {team.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{team.description}</p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 mt-auto">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>{team.members.length} {team.members.length === 1 ? 'member' : 'members'}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/teams/${team.id}`)}
                  >
                    <Users className="h-3.5 w-3.5 mr-1" /> Manage
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(team)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteTarget(team)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Create Dialog ─────────────────────────────────────────────── */}
      <Dialog.Root open={createOpen} onOpenChange={setCreateOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Create team</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </Dialog.Close>
            </div>
            {renderFormBody()}
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={saving}>Cancel</Button>
              </Dialog.Close>
              <Button onClick={handleCreate} disabled={saving || !form.title.trim()}>
                {saving ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog.Root open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Edit team</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </Dialog.Close>
            </div>
            {renderFormBody()}
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={saving}>Cancel</Button>
              </Dialog.Close>
              <Button onClick={() => setEditConfirmOpen(true)} disabled={saving || !form.title.trim()}>
                Save changes
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Edit Confirm Dialog ───────────────────────────────────────── */}
      <Dialog.Root open={editConfirmOpen} onOpenChange={setEditConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-60 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold">Save changes?</Dialog.Title>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to update <strong>{editTarget?.title}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={saving}>Cancel</Button>
              </Dialog.Close>
              <Button onClick={() => { setEditConfirmOpen(false); handleEdit() }} disabled={saving || !form.title.trim()}>
                {saving ? 'Saving…' : 'Confirm'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────── */}
      <Dialog.Root open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <Dialog.Title className="text-lg font-semibold">Delete team</Dialog.Title>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This will also remove all member assignments.
            </p>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={deleting}>Cancel</Button>
              </Dialog.Close>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
