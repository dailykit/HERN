// import { getServerSideSitemap } from "next-sitemap";
// export const GetPost = async () => {
//     const data = await fetch("https://testhern.dailykit.org/products", {
//         method: "GET",
//     });
//     const res = await data.json();
//     return res;
// };
// export const getServerSideProps = async (ctx) => {
//     const siteUrl = "https://testhern.dailykit.org/";
//     const data = await GetPost();
//     const fields = data === null || data === void 0 ? void 0 : data.map((data) => ({
//         loc: `${siteUrl}/${data.id}`,
//         lastmod: new Date().toISOString(),
//     }));
//     return getServerSideSitemap(ctx, fields);
// };
// export default function Site() {
//     //console
// }
