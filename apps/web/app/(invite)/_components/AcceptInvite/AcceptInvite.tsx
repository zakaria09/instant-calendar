'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { authClient } from '@/lib/auth-client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'
import Spinner from '@/components/ui/loadingSpinner'

export default function AcceptInvite({ invitationId }: { invitationId: string }) {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)

  const { data: invite, isLoading, isError } = useQuery({
    queryKey: ['invitation', invitationId],
    queryFn: async () => {
      const { data, error } = await authClient.organization.getInvitation({
        query: { id: invitationId },
      })
      if (error) throw error
      return data
    },
  })

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setAccepted(true)
      setTimeout(() => router.push(`/onboarding/${invitationId}`), 1500)
    },
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (isError || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md px-6 py-4">
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <XCircle className="h-8 w-8 text-red-500" />
            <p className="text-sm text-red-600">Invitation not found or has expired.</p>
            <Button variant="outline" onClick={() => router.push('/')}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md px-6 py-4">
        {accepted ? (
          <CardContent className="flex flex-col items-center gap-3 py-8">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <p className="text-sm font-medium text-neutral-700">Welcome to {invite.organizationName}!</p>
            <p className="text-sm text-neutral-500">Redirecting to setup...</p>
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <h1 className="font-bold text-2xl">You&apos;ve been invited</h1>
              <p className="text-sm text-neutral-500">
                You&apos;ve been invited to join <span className="font-medium text-neutral-900">{invite.organizationName}</span>.
              </p>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={() => acceptMutation.mutate()} disabled={acceptMutation.isPending} className="flex-1">
                {acceptMutation.isPending ? <Spinner /> : 'Accept Invitation'}
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="flex-1">
                Decline
              </Button>
            </CardContent>
            {acceptMutation.isError && (
              <p className="text-sm text-red-600 px-6 pb-4">Failed to accept invitation. Please try again.</p>
            )}
          </>
        )}
      </Card>
    </div>
  )
}