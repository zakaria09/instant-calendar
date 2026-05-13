import React from 'react'
import OrganisationCard from '../_components/OrganisationCard/OrganisationCard'

export default function OrganisationPage() {
  return (
    <div>
      <h1 className="text-2xl font-medium mb-1">Organisation</h1>
      <p className="text-neutral-500 text-sm">View and manage your organisation</p>
      <div className='py-6 '>
        <OrganisationCard />
      </div>
    </div>
  )
}
