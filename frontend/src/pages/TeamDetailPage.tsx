import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { teamService, userService, type Team, type User } from '@/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/use-toast'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowLeft, Layers, UserMinus, UserPlus, UserCircle2, X, Server } from 'lucide-react'

type ApiErr = { response?: { data?: { error?: string } } }

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { hasPrivilege } = useAuth()
  const canManageTeams = hasPrivilege('canManageTeams')

  const [team, setTeam] = useState<Team | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<User | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    const fetchUsers = canManageTeams ? userService.getAll() : Promise.resolve([] as User[])
    Promise.all([teamService.getById(id), fetchUsers])
      .then(([t, users]) => {
        setTeam(t)
        setAllUsers(users)
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load team data' })
      })
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Users not yet in the team — available to assign
  const assignableUsers = useMemo(
    () => allUsers.filter((u) => !team?.members.includes(u.id)),
    [allUsers, team]
  )

  // Resolve userId → User object for display
  const memberUsers = useMemo(
    () =>
      (team?.members ?? [])
        .map((uid) => allUsers.find((u) => u.id === uid))
        .filter((u): u is User => !!u),
    [allUsers, team]
  )

  const handleAssign = async () => {
    if (!id || !selectedUserId) return
    setAssigning(true)
    try {
      await teamService.assignMember(id, selectedUserId)
      setTeam((prev) =>
        prev ? { ...prev, members: [...prev.members, selectedUserId] } : prev
      )
      setSelectedUserId('')
      toast({ title: 'Member assigned' })
    } catch (err: unknown) {
      const msg = (err as ApiErr)?.response?.data?.error ?? 'Failed to assign member'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setAssigning(false)
    }
  }

  const handleRemove = async () => {
    if (!id || !removeTarget) return
    setRemovingId(removeTarget.id)
    try {
      await teamService.removeMember(id, removeTarget.id)
      setTeam((prev) =>
        prev ? { ...prev, members: prev.members.filter((m) => m !== removeTarget.id) } : prev
      )
      setRemoveTarget(null)
      toast({ title: 'Member removed' })
    } catch (err: unknown) {
      const msg = (err as ApiErr)?.response?.data?.error ?? 'Failed to remove member'
      toast({ variant: 'destructive', title: 'Error', description: msg })
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="h-40 rounded-lg bg-muted animate-pulse" />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Team not found.</p>
        <Button variant="link" onClick={() => navigate('/teams')}>Back to Teams</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/teams')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Teams
        </Button>
      </div>

      <div className="flex items-start gap-3">
        <Layers className="h-7 w-7 text-primary shrink-0 mt-1" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team.title}</h1>
          {team.description && (
            <p className="text-muted-foreground text-sm mt-1">{team.description}</p>
          )}
        </div>
      </div>

      <div className="flex">
        <Button variant="outline" size="sm" onClick={() => navigate(`/teams/${id}/instances`)}>
          <Server className="h-4 w-4 mr-1.5" />
          Instances
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Members ──────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Members
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({team.members.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {memberUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCircle2 className="mx-auto h-10 w-10 mb-2 opacity-40" />
                <p className="text-sm">No members yet.</p>
              </div>
            ) : (
              <ul className="divide-y">
                {memberUsers.map((user) => (
                  <li key={user.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="h-8 w-8 rounded-full object-cover shrink-0 border"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {user.role && (
                        <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary capitalize shrink-0">
                          {user.role.name}
                        </span>
                      )}
                    </div>
                    {canManageTeams && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        disabled={removingId === user.id}
                        onClick={() => setRemoveTarget(user)}
                      >
                        <UserMinus className="h-4 w-4 mr-1" />
                        {removingId === user.id ? 'Removing…' : 'Remove'}
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── Assign Member ─────────────────────────────────────── */}
        {canManageTeams && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assign member</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignableUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">All users are already in this team.</p>
              ) : (
                <>
                  <Select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    <option value="">Select a user…</option>
                    {assignableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName}
                        {u.role ? ` (${u.role.name})` : ''}
                      </option>
                    ))}
                  </Select>
                  <Button
                    className="w-full"
                    disabled={!selectedUserId || assigning}
                    onClick={handleAssign}
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    {assigning ? 'Assigning…' : 'Assign to team'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Remove Member Confirm Dialog */}
      <Dialog.Root open={!!removeTarget} onOpenChange={(open) => { if (!open) setRemoveTarget(null) }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-background rounded-lg border shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Remove member</Dialog.Title>
              <Dialog.Close asChild>
                <button className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
              </Dialog.Close>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove <strong>{removeTarget?.firstName} {removeTarget?.lastName}</strong> from this team?
            </p>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline" disabled={!!removingId}>Cancel</Button>
              </Dialog.Close>
              <Button variant="destructive" disabled={!!removingId} onClick={handleRemove}>
                {removingId ? 'Removing…' : 'Remove'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
