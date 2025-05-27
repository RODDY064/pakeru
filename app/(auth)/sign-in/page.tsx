import Input from '@/app/ui/input'
import Link from 'next/link'
import React from 'react'

export default function SignIn() {
  return (
    <div className='flex flex-col items-center pt-16 md:pt-24 font-manrop'>
      <h1 className='text-3xl md:text-4xl font-manrop font-bold'>Welcome Back</h1>
      <p className='font-manrop text-md md:text-lg font-medium my-3'>Please sign-in with your credentials</p>
      <div className='w-[85%] md:w-[30%] bg-black/10 h-11 mt-6  flex items-center justify-center rounded'>
      <Link href="/sign-in" className='w-1/2 h-full font-manrop bg-black cursor-pointer flex items-center justify-center text-white rounded-l'>
      <p className='text-md font-medium'>Sign in</p></Link>
       <Link href="/sign-up" className='w-1/2 h-full  cursor-pointer flex items-center justify-center text-black'>
      <p className='text-md font-medium'>Sign up</p></Link>
      </div>
       <form className='mt-6 px-[2px] w-[85%] md:w-[30%]'>
       <Input 
       image='/icons/email.svg'
       placeH='name@gmail.com' type='text' label='Username' name='username'/>
       <Input 
        image='/icons/password.svg'
        imageW={18}
        imageH={18}
       placeH='*******' type='password' label='Password' name='password' style='mt-3'/>
       <input className='w-full h-11 bg-black mt-10 rounded font-manrop font-semibold  text-white text-md cursor-pointer hover:bg-transparent hover:border-black border hover:text-black' type='submit'/>
       <div className='my-2'><Link href="/forgetten-password" className='cursor-pointer text-blue-500 hover:text-black'>Forgotten password?</Link></div>
       <div className='flex items-center justify-between gap-2'>
        <div className='w-full h-[1px] bg-black/20'></div>
        <p className='text-sm text-black/30 font-manrop'>or</p>
        <div className='w-full h-[1px] bg-black/20'></div>
       </div>
      </form>
    </div>
  )
}
