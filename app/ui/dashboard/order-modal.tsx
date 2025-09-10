"use client";
import React, { use, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, cubicBezier } from "motion/react";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import ProductOrderCard from "./productOrderCard";

export default function OrderModal() {
  const { showOrderModal, setOrderModal, orderInView, loadOrder, deleteOrder } =
    useBoundStore();

  const [state, setState] = useState<"idle" | "loading" | "failed">("loading");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    console.log(orderInView);
    if (orderInView) {
      setState("idle");
    }
  }, [orderInView]);

  return (
    <motion.div
      variants={modalVariants}
      className={`fixed left-0 top-0 z-[99] w-full h-full hidden md:block ${
        showOrderModal ? "pointer-events-auto " : "pointer-events-none "
      }`}>
      <AnimatePresence>
        {showOrderModal && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="absolute w-full h-full bg-black/80"
              onClick={() => setOrderModal(!showOrderModal)}
            />

            {/* Modal */}
            <motion.div className="h-full relative flex z-20 justify-end">
              <motion.div
                key="modal"
                variants={container}
                initial="close"
                animate="open"
                exit="close"
                className="w-[600px] xl:w-[650px] 2xl:w-[680px] bg-white h-full"
              >
                <div className="flex items-center justify-between pt-8 pb-4 px-10 border-b border-black/20">
                  <div className="flex items-center gap-4">
                    <p className="font-avenir text-lg font-normal pt-1">
                      #{orderInView?.IDTrim ?? "ORDER"}
                    </p>
                    {orderInView?.IDTrim && (
                      <div className="px-4 bg-black py-1 text-white font-avenir font-[500] text-md rounded-md cursor-pointer">
                        Fulfiled item
                      </div>
                    )}
                  </div>
                  <div
                    onClick={() => setOrderModal(!showOrderModal)}
                    className="flex  gap-1 cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="w-[16px] h-[1px] rotate-45 bg-black"></div>
                      <div className="w-[16px] h-[1px] rotate-[-45deg] bg-black absolute "></div>
                    </div>
                    <p className="capitalize font-avenir font-[400] text-sm mt-1">
                      CLOSE
                    </p>
                  </div>
                </div>
                <div className="h-full overflow-scroll pb-24">
                  <div className="px-10 py-6 ">
                    <div>
                      <p className="text-black/40 text-md font-avenir font-[300]">
                        Date
                      </p>
                      <p className="font-avenir font-[500] text-lg mt-1">
                        {new Date(orderInView?.date ?? "").toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                          }
                        )}
                        , {orderInView?.time}
                      </p>
                    </div>
                    <div className="mt-4">
                      <p className="text-black/40 text-md font-avenir font-[300] mt-1">
                        Customer
                      </p>
                      <p className="font-avenir font-[500] text-lg">
                        {`${orderInView?.user?.firstname
                          .charAt(0)
                          .toUpperCase()}${orderInView?.user?.firstname.slice(
                          1
                        )} ${orderInView?.user?.lastname
                          .charAt(0)
                          .toUpperCase()}${orderInView?.user?.lastname?.slice(
                          1
                        )}`}
                      </p>
                      <p className="font-avenir font-[500] text-md text-black/50">
                        {orderInView?.user?.email}
                      </p>
                    </div>
                    <div className="mt-10 w-full flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <p className="font-avenir text-lg">Payment Status</p>
                        <div className=" flex  gap-2">
                          <div className="relative flex  items-center">
                            <select
                              value={orderInView?.paymentStatus}
                              onChange={()=>{}}
                              className="appearance-none w-[150px] px-4 py-1 pr-8 text-sm border border-green-500/50 text-green-600 bg-green-50 rounded-lg focus:outline-none"
                            >
                              <option>Completed</option>
                            </select>
                            <Image
                              src="/icons/arrow-gn.svg"
                              width={12}
                              height={12}
                              alt="arrow"
                              className="absolute right-3 opacity-100"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-avenir text-lg">Delivery Status</p>
                        <div className=" flex  gap-2">
                          <div className="relative flex  items-center ">
                            <select
                              value={orderInView?.deliveryStatus}
                              onChange={()=>{}}
                              className="appearance-none w-[150px] px-4 py-1 pr-8 text-sm border border-yellow-500/50 text-yellow-600 bg-yellow-50 rounded-lg focus:outline-none"
                            >
                              <option>Pending</option>
                            </select>
                            <Image
                              src="/icons/arrow-y.svg"
                              width={12}
                              height={12}
                              alt="arrow"
                              className="absolute right-3 opacity-100"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 w-full flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-black/40 text-md font-avenir font-[300]">
                          Product's
                        </p>
                        <p className="size-5 flex  text-sm items-center justify-center border border-red-500 rounded-full">
                          {orderInView?.items.numOfItems}
                        </p>
                      </div>
                      <div className="w-full min-h-[450px] grid grid-cols-2 gap-4">
                        {orderInView?.items.products.map((prod) => (
                          <ProductOrderCard
                            key={prod._id}
                            product={prod.product}
                            variantID={prod.variantID}
                            size={prod.size}
                            quantity={prod.quantiy}
                          />
                        ))}
                      </div>
                      <div className="mt-4">
                        <p className="text-black/70 text-md font-bold font-avenir ">
                          SUBTOTAL
                        </p>
                        <p className="text-black/50 text-xl  font-avenir ">
                          GHS {orderInView?.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="">
                        <p className="text-black/70 font-bold text-md uppercase  font-avenir ">
                          Discount
                        </p>
                        <p className="text-black/50 text-lg  font-avenir ">
                          GHS {orderInView?.discount.toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-black text-2xl font-bold font-avenir ">
                          TOTAL
                        </p>
                        <p className="text-black/50 text-2xl  font-avenir ">
                          GHS {orderInView?.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="text-black/40 text-md font-avenir font-[300]">
                          Commet
                        </p>
                        <textarea
                          placeholder="Add a comment"
                          className="w-full h-24 max-h-24 min-h-24  bg-black/5 mt-2 rounded-2xl border p-3 flex items-start focus:outline-none focus:border-black/30 border-black/20"
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-black/40 text-md font-avenir font-[300]">
                          Actions
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div
                            onClick={() => setOrderModal(!showOrderModal)}
                            className="w-full h-12 bg-black/10 border hover:bg-black/5 border-black/30 rounded-xl cursor-pointer flex items-center justify-center"
                          >
                            <p className="text-md font-avenir text-black">
                              CANCEL
                            </p>
                          </div>
                          <div onClick={() => setShowDeleteConfirm(true)} className="w-full h-12 bg-red-100 hover:bg-red-50 border border-red-500 rounded-xl cursor-pointer flex items-center justify-center">
                            <p className="text-md font-avenir text-red-500">
                              DELETE
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {showDeleteConfirm && (
        <DeleteModal
          orderID={orderInView?._id || ""}
          orderCode={orderInView?.IDTrim || ""}
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </motion.div>
  );
}

// Optimized animation variants
const easingShow = cubicBezier(0.4, 0, 0.2, 1);

// modalVariants.ts
export const modalVariants = {
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      staggerChildren: 0,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      when: "afterChildren",
    },
  },
};

export const overlay = {
  visible: {
    opacity: 1,
    transition: {
      duration: 0.15,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.1,
    },
  },
};

const container = {
  open: {
    x: 0,
    transition: {
      ease: easingShow,
      staggerChildren: 0.06,
      delayChildren: 0.2,
    },
  },
  close: {
    x: 600,
    transition: {
      ease: easingShow,
      when: "afterChildren",
      staggerChildren: 0.01,
    },
  },
};

interface DeleteModalProps {
  orderID: string;
  orderCode: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  orderID,
  orderCode,
  isOpen,
  onClose,
  onDeleteSuccess,
}) => {
  const { deleteOrder } = useBoundStore();
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isConfirmationValid = confirmationText.trim() === orderCode.trim();

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      setDeleteError("Product name does not match");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {

      if(!orderID){
        setDeleteError("Order id is not provided.")
        return
      }

     const res =  await deleteOrder(orderID);

      // Call success callback if provided
      onDeleteSuccess?.();

      // Close modal and reset state
      onClose();
      setConfirmationText("");

      // You might want to show a success toast here
      console.log("Order deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError(
        error instanceof Error
          ? "Failed to delete order. Please try again."
          : "Failed to delete order. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return; // Prevent closing while deleting

    onClose();
    setConfirmationText("");
    setDeleteError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationText(e.target.value);
    if (deleteError) setDeleteError(null); // Clear error when user starts typing
  };

  if (!isOpen) return null;

  return (
    <div className="w-full fixed top-0 left-0 h-full bg-black/90 flex items-center flex-col justify-center z-50">
      <div className="lg:w-[55%] xl:w-[40%] w-[90%] min-h-[450px] bg-white rounded-[26px] p-6 lg:p-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-avenir text-md font-[500] uppercase text-red-500">
            Delete Order
          </p>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="flex gap-1 items-center cursor-pointer hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-[16px] h-[1px] bg-black/60 rotate-45"></div>
              <div className="w-[16px] h-[1px] bg-black/60 rotate-[-45deg] absolute"></div>
            </div>
            <p className="font-avenir text-sm pt-1 text-black/60">CLOSE</p>
          </button>
        </div>

        {/* Warning Message */}
        <p className="font-avenir mt-6 text-lg lg:text-xl">
          Are you sure you want to{" "}
          <span className="text-red-500 font-semibold">delete</span> order{" "}
          <span className="font-semibold"> "{orderCode}"</span>? This action
          cannot be undone, and once deleted, the order will be permanently
          removed from your order list.
        </p>

        {/* Confirmation Input */}
        <div className="mt-8">
          <p className="font-avenir text-lg lg:text-xl font-[500]">
            Enter the order code 
             <span className="font-semibold"> "{orderCode}"</span> to confirm
            delete.
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={handleInputChange}
            disabled={isDeleting}
            placeholder={`Type "${orderCode}" here`}
            className="w-full h-12 font-avenir text-md border border-black/20 bg-black/5 mt-3 px-3 rounded-[10px] focus:outline-none focus:border-black/40 disabled:opacity-50 disabled:cursor-not-allowed"
          />

          {/* Error Message */}
          {deleteError && (
            <p className="text-red-500 text-sm mt-2 font-avenir">
              {deleteError}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 lg:mt-10 flex items-center gap-4">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="w-full h-12 cursor-pointer p-2 bg-black/10 flex items-center justify-center hover:bg-black/5 border border-black/20 rounded-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <p className="font-avenir text-lg lg:text-xl">Cancel</p>
          </button>

          <button
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
            className="w-full h-12 cursor-pointer p-2 bg-red-200 flex items-center justify-center hover:bg-red-100 border border-red-500 rounded-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-red-100"
          >
            <p className="font-avenir text-lg lg:text-xl text-red-500">
              {isDeleting ? "Deleting..." : "Delete"}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
