"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useLoading } from "@/context/LoadingContext";
import teteGuild from "../../../public/assets/images/GuildImage/vanCleef.png";
import dogGuild from "../../../public/assets/images/GuildImage/dog.jpg";
import rocFunGuild from "../../../public/assets/images/GuildImage/rocfun.png";

interface FileTreeItem {
  id: string;
  name: string;
  type: "folder" | "file";
  icon?: string;
  href?: string;
  children?: FileTreeItem[];
}

const fileTree: FileTreeItem[] = [
  {
    id: "home",
    name: "Home",
    type: "file",
    icon: "https://api.iconify.design/fluent-color/home-16.svg?color=%23c4b5fd",
    href: "/",
  },
  {
    id: "muad",
    name: "MUAD",
    type: "file",
    icon: "",
    href: "/muad",
  },
  {
    id: "5thAnvs",
    name: "5th Anniversary",
    type: "file",
    icon: "https://api.iconify.design/flowbite/gift-box-solid.svg?color=%23f4fb00",
    href: "/5thAnvs",
  },
  {
    id: "features",
    name: "Features",
    type: "folder",
    icon: "",
    children: [
      // {
      //   id: "classes",
      //   name: "Classes Stone",
      //   type: "file",
      //   icon: "💎",
      //   href: "/classes-stone"
      // },
      {
        id: "lab",
        name: "Central Laboratory",
        type: "file",
        icon: "https://api.iconify.design/picon/lab.svg?color=%23f4fb00",
        href: "/central-lab",
      },
      {
        id: "monster",
        name: "Monster x3",
        type: "file",
        icon: "https://api.iconify.design/openmoji/ogre.svg?color=%23f4fb00",
        href: "/monsterx3",
      },
      {
        id: "endlesstower",
        name: "Endless Tower",
        type: "file",
        icon: "https://api.iconify.design/fluent-emoji-flat/tokyo-tower.svg?color=%23f4fb00",
        href: "/endless-tower",
      },
    ],
  },
  // {
  //   id: "vip",
  //   name: "VIP Search",
  //   type: "file",
  //   icon: "🌟",
  //   href: "/vip-search"
  // },
  {
    id: "dungeon",
    name: "Dungeon",
    type: "folder",
    icon: "",
    children: [
      {
        id: "facewormnest",
        name: "Faceworm Nest Guide",
        type: "file",
        icon: "https://api.iconify.design/hugeicons/worm.svg?color=%23f4fb00",
        href: "/facewormnest-guide",
      },
      {
        id: "toyfactory",
        name: "Toy Factory Guide",
        type: "file",
        icon: "https://api.iconify.design/flowbite/teddy-bear-solid.svg?color=%23f4fb00",
        href: "/toyfactory-guide",
      },
      {
        id: "jittlebug",
        name: "Jittlebug",
        type: "file",
        icon: "https://api.iconify.design/fluent-emoji-flat/world-map.svg",
        href: "/jittlebug",
      },
      // {
      //   id: "endlesstower",
      //   name: "- Endless Tower",
      //   type: "file",
      //   icon: "🗼",
      //   href: "/endless-tower",
      // },
    ],
  },

  {
    id: "calcbp",
    name: "Battle Pass Calculator",
    type: "file",
    icon: "https://api.iconify.design/emojione/ticket.svg?color=%23f4fb00",
    href: "/calc-bp",
  },
  {
    id: "randomscroll",
    name: "Random Scroll",
    type: "file",
    icon: "https://api.iconify.design/fluent-emoji-flat/scroll.svg",
    href: "/random-scroll",
  },
  // {
  //   id: "atkcalc",
  //   name: "ATK Calculator",
  //   type: "file",
  //   icon: "https://api.iconify.design/fluent-emoji-flat/crossed-swords.svg",
  //   href: "/atk-calc",
  // },
  {
    id: "donate",
    name: "Donate",
    type: "file",
    icon: "https://api.iconify.design/fluent-emoji-flat/red-heart.svg",
    href: "/donate",
  },
  {
    id: "say-something",
    name: "บอกเรา",
    type: "file",
    icon: "https://api.iconify.design/fluent-emoji-flat/speech-balloon.svg",
    href: "/say-something",
  },
  // {
  //   id: "vct-calc",
  //   name: "VCT Calculator",
  //   type: "file",
  //   icon: "⌛",
  //   href: "/vct-calc",
  // },
  // {
  //   id: "aspd",
  //   name: "The Flash Calc (ASPD)",
  //   type: "file",
  //   icon: "⚡",
  //   href: "/aspd-calc",
  // },
  // {
  //   id: "expcalc",
  //   name: "Exp Calculator",
  //   type: "file",
  //   icon: "📊",
  //   href: "/exp-calc",
  // },
  // {
  //   id: "tools",
  //   name: "Tools",
  //   type: "folder",
  //   icon: "🛠️",
  //   children: [
  //     {
  //       id: "muad",
  //       name: "MUAD",
  //       type: "file",
  //       icon: "⚙️",
  //       href: "/muad"
  //     },
  //     {
  //       id: "patch",
  //       name: "Patch Convert",
  //       type: "file",
  //       icon: "📦",
  //       href: "/patch-convert"
  //     },
  //     {
  //       id: "visual",
  //       name: "Visual",
  //       type: "file",
  //       icon: "👁️",
  //       href: "/visual"
  //     }
  //   ]
  // }
];

function FileTreeNode({
  item,
  level = 0,
  toggleDrawer,
}: {
  item: FileTreeItem;
  level?: number;
  toggleDrawer: () => void;
}) {
  const { pendingHref, startNavigation } = useLoading();
  const pathname = usePathname();
  // Open the folder that holds the current Tool so the active link is visible.
  const [expanded, setExpanded] = useState(
    () => item.children?.some((child) => child.href === pathname) ?? false,
  );
  const isFolder = item.type === "folder";
  const isActive = !isFolder && item.href === pathname;
  const isPending = !isFolder && item.href === pendingHref;

  const handleLinkClick = (event: React.MouseEvent) => {
    startNavigation(item.href || "#", event);
    toggleDrawer();
  };

  const paddingLeft = level * 12;

  return (
    <div key={item.id}>
      {isFolder ? (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            title={item.name}
            style={{ paddingLeft: `${8 + paddingLeft}px` }}
            className="w-full flex items-center py-2.5 px-3 rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium gap-2 group"
          >
            <span
              aria-hidden="true"
              className="w-5 h-5 shrink-0 bg-center bg-no-repeat bg-contain transition-transform duration-200 group-hover:brightness-125"
              style={{
                backgroundImage: `url(https://api.iconify.design/mdi/folder${expanded ? "-open" : ""}.svg?color=%2393c5fd)`,
              }}
            >
            </span>
            <span className="text-sm shrink-0">
              {item.icon && (
                <span
                  aria-hidden="true"
                  className="block w-5 h-5 bg-center bg-no-repeat bg-contain"
                  style={{ backgroundImage: `url(${item.icon})` }}
                />
              )}
            </span>
            <span className="truncate text-base-content/80 group-hover:text-base-content">
              {item.name}
            </span>
            <span className="ml-auto text-xs text-base-content/50 group-hover:text-primary">
              {expanded ? "−" : "+"}
            </span>
          </button>
          {expanded && (
            <div className="border-l-2 border-primary/20 ml-6">
              {item.children?.map((child) => (
                <FileTreeNode
                  key={child.id}
                  item={child}
                  level={level + 1}
                  toggleDrawer={toggleDrawer}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.href || "#"}
          onClick={handleLinkClick}
          title={item.name}
          aria-current={isActive ? "page" : undefined}
          style={{ paddingLeft: `${8 + paddingLeft}px` }}
          className={`flex items-center py-2.5 px-3 rounded-lg transition-colors text-sm w-full gap-2 group ${
            isActive || isPending
              ? "bg-primary/15 text-primary font-semibold"
              : "hover:bg-primary/10"
          }`}
        >
          <span className="w-5 h-5 shrink-0">
            {item.icon && (
              <span
                aria-hidden="true"
                className="block w-5 h-5 bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: `url(${item.icon})` }}
              />
            )}
          </span>
          <span className={`truncate font-medium ${isActive || isPending ? "" : "text-base-content/85 group-hover:text-base-content"}`}>
            {item.name}
          </span>
          {isPending && (
            <span className="loading loading-spinner loading-xs ml-auto shrink-0" aria-hidden="true" />
          )}
        </Link>
      )}
    </div>
  );
}

export default function SidebarPage() {
  return (
    <>
      {/* Spacer: the Navbar (z-40) stays above the Sidebar so the Menu toggle can close it */}
      <div aria-hidden="true" className="h-16 shrink-0" />

      {/* Sidebar Navigation - File Tree */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-2">
          {fileTree.map((item) => (
            <FileTreeNode
              key={item.id}
              item={item}
              toggleDrawer={() => {
                const checkbox = document.getElementById(
                  "is-drawer-open",
                ) as HTMLInputElement;
                if (checkbox) checkbox.checked = false;
              }}
            />
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-base-300 bg-base-200 mt-auto shrink-0">
        <p className="text-[10px] text-base-content/60 mb-3">
          © 2025 ROC Library. All rights reserved.
        </p>
        <p className="text-[10px] font-semibold text-base-content/80 mb-2">Supporter</p>
        <div className="flex justify-center gap-2">
          {[
            {
              img: teteGuild,
              label: "ลูกคุณหนูใจแตก",
            },
            {
              img: dogGuild,
              label: "หมากัดหมวด",
            },
            {
              img: rocFunGuild,
              label: "ROC หรรษา",
            },
          ].map((g, i) => (
            <div key={i} className="relative group">
              <Image
                src={g.img}
                alt={g.label}
                className="w-6.25 h-6.25 rounded border-2 border-base-100 hover:scale-110 transition-transform cursor-pointer"
              />
              <span className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 px-2 py-1 text-8px text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {g.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
