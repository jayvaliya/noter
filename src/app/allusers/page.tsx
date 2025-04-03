import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import React from 'react'

async function page() {
    const allUsers = await prisma.user.findMany()
    return (
        <div>
            {allUsers.map((user) => (
                <div key={user.id} className="flex flex-col items-center justify-center p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-4">
                        {/* <Image src={user.image || '/default-avatar.png'} alt={user.name || "name"} className="w-12 h-12 rounded-full" /> */}
                        <div className="flex flex-col">
                            <span className="text-lg font-semibold">{user.name}</span>
                            <span className="text-sm text-gray-500">{user.email}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default page
