import { redirect } from "next/navigation";

// The homepage is just a door back into the product.
// There is exactly one restaurant we care about, so /
// sends visitors straight to its page.
export default function Home() {
  redirect("/restaurant/1");
}
