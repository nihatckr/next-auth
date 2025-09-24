
import React from 'react'
import { currentUser } from '@/lib/auth';

const ProfilePage = async () => {
  const user = await currentUser();
  return (
    <div>
      {JSON.stringify(user, null, 2)}
    </div>
  )
}

export default ProfilePage
