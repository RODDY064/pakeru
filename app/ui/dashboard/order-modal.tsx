"use client";
import React, { useEffect,useState, Suspense } from "react";
import { motion, AnimatePresence, cubicBezier } from "motion/react";
import { useBoundStore } from "@/store/store";
import Image from "next/image";
import ProductOrderCard from "./productOrderCard";
import { capitalize } from "@/libs/functions";
import { useRouter, useSearchParams } from "next/navigation";
import StatusBadge from "./statusBadge";
import { useApiClient } from "@/libs/useApiClient";
import { cn } from "@/libs/cn";
import Cedis from "../cedis";

// Core modal content component
function OrderModalContent({ type }: { type: "unfulfilled" | "fulfilled" }) {
  const { patch, get } = useApiClient();

  const {
    showOrderModal,
    setOrderModal,
    orderInView,
    loadOrder,
    updateOrder,
    singleOrderState,
    setSingleOrderState,
    loadStoreProducts,
  } = useBoundStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderIdTrim = searchParams.get("order");

  useEffect(() => {
    if (orderInView) {
      setSingleOrderState("success");

      if (orderIdTrim !== orderInView.IDTrim) {
        const params = new URLSearchParams(window.location.search);
        params.set("order", orderInView.IDTrim ?? "");
        router.replace(`${window.location.pathname}?${params.toString()}`);
      }
    }
  }, [orderInView, searchParams, router, setSingleOrderState, loadOrder]);

  const handleUpdate = async (
    orderId: string,
    updates: {
      fulfilledStatus?: "fulfilled" | "unfulfilled";
      deliveryStatus?: "delivered" | "pending" | "cancelled" | "shipped";
    }
  ) => {
    if (isUpdating || !orderInView) return;

    setIsUpdating(true);
    try {
      await updateOrder(orderId, updates as any, { patch, get });
      setOrderModal(false);
    } catch (error) {
      console.error("Update failed:", error);
      setOrderModal(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFulfill = () => {
    if (orderInView) {
      handleUpdate(orderInView._id, { fulfilledStatus: "fulfilled" });
    }
  };

  useEffect(() => {
    loadStoreProducts(false, get);
  }, [singleOrderState]);

  const handleDeliveryStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (!orderInView || isUpdating) return;

    const newStatus = e.target.value as
      | "delivered"
      | "pending"
      | "cancelled"
      | "shipped";
    console.log(newStatus);

    await handleUpdate(orderInView._id, { deliveryStatus: newStatus });
  };

  function formatString(value: string): string {
    const cleaned = value.replace(/[_-]/g, " ").toLowerCase().trim();
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return (
    <motion.div
      variants={modalVariants}
      transition={{ type: "tween" }}
      className={`fixed left-0 top-0 z-[99] w-full h-full hidden md:block ${
        showOrderModal ? "pointer-events-auto" : "pointer-events-none"
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
              className="absolute w-full h-full bg-black/90"
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
                      {orderInView?.IDTrim ?? orderIdTrim}
                    </p>
                  </div>
                  <div
                    onClick={() => setOrderModal(!showOrderModal)}
                    className="flex gap-1 cursor-pointer"
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="w-[16px] h-[1px] rotate-45 bg-black"></div>
                      <div className="w-[16px] h-[1px] rotate-[-45deg] bg-black absolute"></div>
                    </div>
                    <p className="capitalize font-avenir font-[400] text-sm mt-1">
                      CLOSE
                    </p>
                  </div>
                </div>

                {singleOrderState === "loading" && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src="/icons/loader.svg"
                      width={36}
                      height={36}
                      alt="loader"
                    />
                  </div>
                )}

                {singleOrderState === "success" && (
                  <div className="h-full overflow-scroll pb-24">
                    <div className="px-10 py-6">
                      <div>
                        <p className="text-black/50 text-md font-avenir font-[300]">
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
                        <p className="text-black/50 text-md font-avenir font-[300] mt-1">
                          Customer
                        </p>
                        <p className="font-avenir font-[500] text-lg">
                          {capitalize(orderInView?.user.firstname)}{" "}
                          {capitalize(orderInView?.user.lastname)}
                        </p>
                        <p className="font-avenir font-[500] cursor-pointer text-blue-600 decoration-dotted underline underline-offset-2 text-md">
                          {orderInView?.user?.email}
                        </p>
                         <p className="font-avenir font-[500] cursor-pointer text-black/70 pt-0.5  text-md">
                          {orderInView?.shippingAddress?.phoneNumber}
                        </p>
                      </div>
                      <div className="mt-6">
                        <p className="text-black/50 text-md font-avenir font-[300] mt-1">
                          Payment method
                        </p>
                        <p className="font-avenir font-[500] text-md mt-1">
                          {formatString(orderInView?.paymentChannel??"")}
                        </p>
                        <p className="font-avenir font-[500] text-sm ">
                          {orderInView?.number}
                        </p>
                      </div>
                      <div className="mt-4">
                        <p className="text-black/50 text-md font-avenir font-[300] mt-1">
                          Address
                        </p>
                        <p className="font-avenir font-[500] text-md mt-1">
                          {orderInView?.shippingAddress?.address},{" "}
                          {orderInView?.shippingAddress?.town}
                        </p>
                        <p className="font-avenir font-[500] text-md ">
                          {orderInView?.shippingAddress?.region}
                        </p>
                      </div>

                      <div className="mt-10 w-full flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <p className="font-avenir text-lg">Payment Status</p>
                          <div className="flex gap-2">
                            <StatusBadge
                              status={orderInView?.paymentStatus as string}
                              statuses={["completed", "pending", "cancelled"]}
                              className="w-[150px] justify-start px-3"
                            />
                          </div>
                        </div>
                        {type !== "unfulfilled" && (
                          <div className="flex items-center justify-between">
                            <p className="font-avenir text-lg">
                              Delivery Status
                            </p>
                            <div className="flex gap-2">
                              <div className="relative flex items-center">
                                <select
                                  value={orderInView?.deliveryStatus.toLowerCase()}
                                  onChange={handleDeliveryStatusChange}
                                  disabled={isUpdating}
                                  className={cn(
                                    "appearance-none w-[150px] px-4 py-1 pr-8 text-sm border border-yellow-500/50 text-yellow-600 bg-yellow-50 rounded-lg focus:outline-none disabled:opacity-50",
                                    {
                                      "border-green-500/50 text-green-600 bg-green-50 ":
                                        orderInView?.deliveryStatus ===
                                        "delivered",
                                      "border-red-500/50 text-red-600 bg-red-50 ":
                                        orderInView?.deliveryStatus ===
                                        "cancelled",
                                      "border-blue-500/50 text-blue-600 bg-blue-50 ":
                                        orderInView?.deliveryStatus ===
                                        "shipped",
                                    }
                                  )}
                                >
                                  <option value="delivered">Delivered</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="pending">Pending</option>
                                  <option value="cancelled">Cancelled</option>
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
                        )}
                      </div>

                      <div className="mt-6 w-full flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-black/40 text-md font-avenir font-[300]">
                            Products
                          </p>
                          <p className="size-5 flex text-sm items-center justify-center border border-red-500 rounded-full">
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
                              quantity={prod.quantity}
                            />
                          ))}
                        </div>

                        {/* <div className="mt-4">
                          <p className="text-black/40 text-md  font-avenir">
                            SUBTOTAL
                          </p>
                          <p className="text-black text-xl font-avenir">
                            GHS {orderInView?.total.toFixed(2)}
                          </p>
                        </div>

                        <div className="">
                          <p className="text-black/40 text-md uppercase font-avenir">
                            Discount
                          </p>
                          <p className="text-black text-xl font-avenir">
                            GHS {orderInView?.discount.toFixed(2)}
                          </p>
                        </div> */}

                        <div className="mt-10">
                          <p className="text-black/40 text-xl font-bold font-avenir">
                            TOTAL
                          </p>
                          <div className=" flex items-center gap-2">
                            <Cedis
                              size={20}
                              cedisStyle="opacity-100"
                              className="text-2xl"
                            />{" "}
                            <p className=" text-2xl font-avenir flex pt-[6px]">
                              {orderInView?.total.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {orderInView?.fulfilledStatus === "unfulfilled" && (
                          <button
                            type="button"
                            onClick={handleFulfill}
                            disabled={isUpdating}
                            className="px-4 my-10 py-3 text-xl text-center bg-black text-white font-avenir font-[500] rounded-xl cursor-pointer hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                           {isUpdating ? "Updating fulfillment status..." : "Mark as fulfilled"}
                          </button>
                        )}

                        {type !== "unfulfilled" && (
                          <>
                            {/* <div className="mt-2">
                              <p className="text-black/40 text-md font-avenir font-[300]">
                                Actions
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <div
                                  className="w-full h-12 bg-black border text-white hover:bg-black/5 hover:text-black border-black/30 rounded-xl cursor-pointer flex items-center
                                   justify-center"
                                >
                                  <p className="text-md font-avenir ">
                                    Print Receipt
                                  </p>
                                </div>
                              </div>
                            </div> */}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
          onDeleteSuccess={() => {
            setOrderModal(false);
            setShowDeleteConfirm(false);
          }}
        />
      )}
    </motion.div>
  );
}

// Main component with Suspense boundary
export default function OrderModal({
  type,
}: {
  type: "unfulfilled" | "fulfilled";
}) {
  return (
    <Suspense fallback={null}>
      <OrderModalContent type={type} />
    </Suspense>
  );
}

// Animation variants
const easingShow = cubicBezier(0.4, 0, 0.2, 1);

export const modalVariants = {
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      duration: 0.3,
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
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isConfirmationValid = confirmationText.trim() === orderCode.trim();

  const handleDelete = async () => {
    if (!isConfirmationValid) {
      setDeleteError("Order code does not match");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      if (!orderID) {
        setDeleteError("Order ID is not provided.");
        return;
      }
      onDeleteSuccess?.();
      onClose();
      setConfirmationText("");
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError("Failed to refund order. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    onClose();
    setConfirmationText("");
    setDeleteError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationText(e.target.value);
    if (deleteError) setDeleteError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="w-full fixed top-0 left-0 h-full bg-black/90 flex items-center flex-col justify-center z-50">
      <div className="lg:w-[55%] xl:w-[40%] w-[90%] min-h-[450px] bg-white rounded-[26px] p-6 lg:p-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-avenir text-md font-[500] uppercase text-red-500">
            Refund Order Payment
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
          <span className="text-red-500 font-semibold">refund</span> order
          <span className="font-semibold"> "{orderCode}"</span> payment? This
          action cannot be undone, and once deleted, the order will be
          permanently removed from your order list.
        </p>

        {/* Confirmation Input */}
        <div className="mt-8">
          <p className="font-avenir text-lg lg:text-xl font-[500]">
            Enter the order code
            <span className="font-semibold"> "{orderCode}"</span> to confirm
            refund.
          </p>
          <input
            type="text"
            value={confirmationText}
            onChange={handleInputChange}
            disabled={isDeleting}
            placeholder={`Type "${orderCode}" here`}
            className="w-full h-12 font-avenir text-md border border-black/20 bg-black/5 mt-3 px-3 rounded-[10px] focus:outline-none focus:border-black/40 disabled:opacity-50 disabled:cursor-not-allowed"
          />

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
              {isDeleting ? "Refunding..." : "Refund Payment"}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
