import { capitalize } from "@/libs/functions";
import Image from "next/image";
import React, { useMemo } from "react";
import ClothTypeModal from "./clothTypeModal";
import { useBoundStore } from "@/store/store";
import { ClothType } from "@/store/general";
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";

type SizeTypeForm = {
  sizeType: {
    gender: "male" | "female" | "unisex" | "";
    clothType: string;
  };
};

type SizeTypeProps = {
  register: any;
  errors: any;
  watch: any;
  setValue: any;
};

export default function SizeType({ register, errors, watch, setValue }: SizeTypeProps) {
  const { clothTypes } = useBoundStore();
  
 
  const gender = watch("sizeType.gender");
  const clothTypeId = watch("sizeType.clothType");
  
  const selectedCloth = useMemo(
    () => clothTypes.find((cloth) => cloth._id === clothTypeId) ?? null,
    [clothTypes, clothTypeId]
  );

  const handleClothSelect = (id: string) => {
    setValue("sizeType.clothType", id, { shouldValidate: true });
  };

  return (
    <div className="w-full h-auto flex-1 bg-white border border-black/20 rounded-[26px] inline-block self-start p-4 md:p-6 py-8 relative overflow-hidden">
      {/* Gender Selection */}
      <div>
        <div className="flex justify-between items-center">
          <p className="font-avenir font-[500] text-lg">Gender</p>
        </div>
        
        <div className="relative mt-2 flex items-center">
          <select
            {...register("sizeType.gender")}
            className="w-full h-10 font-avenir p-2 px-3 appearance-none border border-black/20 focus:outline-none focus:border-black/50 rounded-xl"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>
          
          <div className="absolute right-3 pointer-events-none">
            <Image src="/icons/arrow.svg" width={16} height={16} alt="" />
          </div>
        </div>
        
        {errors?.sizeType?.gender && (
          <p className="text-red-500 text-sm mt-1">
            {errors.sizeType.gender.message}
          </p>
        )}
      </div>


      <ClothTypeModal
        selectedClothType={clothTypeId}
        setValue={setValue}
        errors={errors}
        register={register}
      />

      {/* Summary Card */}
      <div className="mt-10 p-3 bg-blue-50 rounded-2xl border border-blue-200">
        <div className="flex justify-between text-sm">
          <span className="text-blue-700 font-avenir">Gender:</span>
          <span className="font-medium text-blue-800 font-avenir">
            {gender ? capitalize(gender) : "Not chosen"}
          </span>
        </div>
        
        <div className="flex justify-between text-sm mt-1">
          <span className="text-blue-700 font-avenir">Cloth Type:</span>
          <span className="font-medium text-blue-800 font-avenir">
            {selectedCloth?.name ? capitalize(selectedCloth.name) : "Not chosen"}
          </span>
        </div>
      </div>
    </div>
  );
}