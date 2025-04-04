import { IconType } from "react-icons";

export interface RouteItem {
    path: string;
    label: string;
    icon: IconType;
    requiresAuth?: boolean;
}