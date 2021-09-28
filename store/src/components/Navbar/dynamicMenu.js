import React, { useState } from "react";
import NavLink from "next/link";
import DropdownMenu from "./dropdown";

export default function DynamicMenu({ pathname, menuItems }) {
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
  return (
    <>
      {menuItems.map((menuItem) => {
        return (
          <li
            key={menuItem?.id}
            className="nav-list-item"
            onClick={() =>
              setIsDropDownOpen(
                (prev) => menuItem.childNavigationMenuItems.length > 0 && !prev
              )
            }
          >
            {menuItem?.url ? (
              <NavLink href={`${menuItem?.url || "#"}`}>
                <a className={pathname === menuItem?.url && "activeLink"}>
                  {menuItem?.label}
                </a>
              </NavLink>
            ) : (
              <button class="dropdownMenuBtn">
                {menuItem?.label}
                {isDropDownOpen &&
                  menuItem?.childNavigationMenuItems.length > 0 && (
                    <DropdownMenu items={menuItem?.childNavigationMenuItems} />
                  )}
              </button>
            )}
          </li>
        );
      })}
    </>
  );
}
