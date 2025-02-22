import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  endpoints: (builder) => ({
    getCountry: builder.query({
      query: () => ({
        url: "https://restcountries.com/v3.1/independent",
        method: "GET",
        params: {
          status: "true",
          fields: "name",
        },
      }),
    }),
  }),
});

export const { useGetCountryQuery } = publicApi;
export default publicApi;
