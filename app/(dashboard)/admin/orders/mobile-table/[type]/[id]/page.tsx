import React from 'react'

export default async function ProductSingle({
params,
}:{ params: Promise<{ id:string }>; }
) {

     const { id } = await params;

  return (
    <div className='pt-24'>ProductSingle {id}</div>
  )
}
