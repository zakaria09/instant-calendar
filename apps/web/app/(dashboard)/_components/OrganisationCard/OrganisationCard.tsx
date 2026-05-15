'use client'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { UserPlus, Users, Mail } from 'lucide-react'
import React from 'react'
import { Input } from '@/components/ui/input'
import MemberTab from './MemberTab/MemberTab'
import InvitationsTab from './InvitationsTab/InvitationsTab'
import { useForm } from "react-hook-form"
import { authClient } from '@/lib/auth-client'
import { useOrganisation } from '@/app/providers/organisationProvider'

export default function OrganisationCard() {
  const { organisation, isLoading: isLoadingOrganisation } = useOrganisation();
  const { register, handleSubmit } = useForm()

  const handleAddMember = async (data: { email: string }) => {
    const email = data.email.trim()
    if (email && !isLoadingOrganisation) {
      console.log('Invite member:', email)
      const { data, error } = await authClient.organization.inviteMember({
        email: email,
        role: "member", 
        organizationId: organisation?.id,
        resend: true,
      });
      console.log('Invite response:', { data, error });
      // TODO: Handle success and error states, e.g., show a notification to the user
    }
  }

  return (
    <Card className='px-6 py-4'>
      <CardHeader>
        <h1 className='font-bold text-3xl capitalize'>{organisation?.name}</h1>
        <h2 className='text-sm text-neutral-500'>Organisation Members</h2>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div>
          <form
            onSubmit={handleSubmit((data) =>
              handleAddMember(data as {email: string}),
            )}
            className='flex sm:flex-row flex-col gap-2 w-full'
          >
            <Input
              type='email'
              placeholder='Enter email address'
              {...register('email')}
            />
            <Button type='submit' className='gap-2'>
              <UserPlus className='h-4 w-4' />
              Add Member
            </Button>
          </form>
        </div>

        <Tabs defaultValue='members'>
          <TabsList>
            <TabsTrigger value='members' className='cursor-pointer gap-2'>
              <Users className='h-4 w-4' />
              Members
            </TabsTrigger>
            <TabsTrigger value='invites' className='cursor-pointer gap-2'>
              <Mail className='h-4 w-4' />
              Invites
            </TabsTrigger>
          </TabsList>

          <TabsContent value='members' className='min-h-25'>
            <MemberTab />
          </TabsContent>

          <TabsContent value='invites' className='min-h-25'>
            <InvitationsTab organisationId={organisation?.id} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}