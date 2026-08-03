import React from 'react'
import { Folder } from 'lucide-react'
import { EmptyState } from './EmptyState'

interface EmptyProjectsProps {
  onCreateClick: () => void
}

export const EmptyProjects: React.FC<EmptyProjectsProps> = ({ onCreateClick }) => {
  return (
    <EmptyState
      icon={Folder}
      title="No projects yet"
      description="Create your first BrandSpark AI project to begin generating logos, slogans and brand identities."
      actionLabel="Create Project"
      onAction={onCreateClick}
    />
  )
}
