"use client"

import React from 'react'
import ProductCard from './product-card'
import { useBoundStore } from '@/store/store'
import { motion } from 'motion/react'
import { cn } from '@/libs/cn'

export default function NavCurtain() {
    const { navSearch, curtain} = useBoundStore()


  return (
   <motion.div 
   variants={ConAnimate}
   animate={curtain ==='show' ? 'show' :'hide'}
   initial='hide'
   className='w-full absolute h-[542px] max-h-[542px] flex-none   md:top-[4.2rem] left-0 invisible group-hover/nav:visible '>
    <p>hello</p>
    <motion.div 
    variants={VailAnimate as any}
    className={cn('w-full absolute invisible group-hover/nav:visible vail h-screen bg-[rgba(232,232,237,.4)] backdrop-blur-2xl z-[-10]')}></motion.div>
 
    {/* <motion.div 
    variants={VailAnimate as any}
    className={cn('w-full absolute invisible group-hover/nav:visible vail h-screen bg-[rgba(232,232,237,.4)] backdrop-blur-2xl')}></motion.div>
    <motion.div
    variants={CurtAnimate}
     className="bg-white overflow-hidden  relative   z-20 text-black  border-black border-t-[0.5px] px-4 md:px-8 py-8 h-fit">
    <p className='pb-6  text-sm font-manrop md:text-md text-black/30 font-semibold uppercase'>SHOWING FOR: 
    <span className='font-manrop font-semibold invisible text-black mx-2'>{navSearch.toLocaleUpperCase()}</span></p>
    <ProductCard type='small'/>
   </motion.div> */}
   </motion.div>
  )
}

const ConAnimate = {
  show:{},
  hide:{}
}

const VailAnimate = {
  show: {
    opacity: 1,
    transition: "opacity .32s cubic-bezier(.4,0,.6,1) 80ms,visibility .32s step-end 80ms"
  },
  hide: { 
    opacity: 0
  }
}

const CurtAnimate = {
  show:{
    height:542,
    opacity:1,
    transtition:{
      height:2.61
    }
  },
  hide:{
   height:0,
   opacity:0
  }
}