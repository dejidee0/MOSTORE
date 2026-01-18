"use client";
import { useCurrentUser, useCurrentVendor } from "@/hooks/use-auth";
import React from "react";

const Test = () => {
  const { data: user, isLoading, error } = useCurrentUser();
  const userId = user?.id;
  const {
    data: vendor,
    isLoading: loading,
    error: err,
  } = useCurrentVendor({ userId });
  if (isLoading) return <p>User fetching...</p>;
  if (error) throw new Error();
  console.log(user);
  console.log(vendor);
  return <div>{user.id}</div>;
};

export default Test;
