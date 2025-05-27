import { type StateCreator } from 'zustand'
import { Store } from './store'

type  ProductType = {
        name:string,
        description:string,
        size:string[],
        images:string[],
        colors:string[],
        price:number,
        category:string,
        selectedSize?:string,
        selectecColor:string

    }


export type CartStore = {
    cartInView:boolean,
    Product:ProductType[],
    setCartInView:()=>void
}


export const useCartStore: StateCreator<
  Store,
  [['zustand/immer', never]],
  [],
  CartStore
> = (set)=>({
    cartInView:false,
    Product:[],
    setCartInView:()=>set((state)=>({
        cartInView:!state.cartInView
    }))
})

