'use client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { orgStorage } from '@/utils/org-storage'
import { UserPlus, Users, Mail } from 'lucide-react'
import React, { useRef } from 'react'
import { Input } from '@/components/ui/input'
import MemberTab from './MemberTab/MemberTab'

export default function OrganisationCard() {
  const org = orgStorage.get()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddMember = () => {
    const email = inputRef.current?.value.trim()
    if (email) {
      console.log('Invite member:', email)
      inputRef.current!.value = ''
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddMember()
    }
  }

  return (
    <Card className="px-6 py-4">
      <CardHeader>
        <h1 className="font-bold text-3xl capitalize">{org?.name}</h1>
        <h2 className="text-sm text-neutral-500">Organisation Members</h2>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="email"
            placeholder="Enter email address"
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleAddMember} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        </div>

        <Tabs defaultValue="members">
          <TabsList>
            <TabsTrigger value="members" className="cursor-pointer gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="invites" className="cursor-pointer gap-2">
              <Mail className="h-4 w-4" />
              Invites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="min-h-25">
            <MemberTab />
          </TabsContent>

          <TabsContent value="invites" className="min-h-25">
            <p className="text-neutral-500">No pending invites.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}