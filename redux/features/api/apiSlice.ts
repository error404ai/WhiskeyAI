/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.AUTH_URL,
    mode: "cors",
    prepareHeaders: async (headers) => {
      headers.set("Authorization", `Bearer `);
      return headers;
    },
  }),
  endpoints: (_builders) => ({}),
});
