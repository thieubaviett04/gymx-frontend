import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
  size?: number | string;
}

/**
 * Icon Xem chi tiết (Eye / Shape) chuẩn Figma Node 1438:11026 (#1440:11115)
 * Màu sắc mặc định: #FFB800 (Figma Amber / Yellow)
 */
export function EyeViewIcon({
  className,
  color = '#FFB800',
  size = 20,
  width,
  height,
  ...props
}: IconProps) {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M10 6.21314C8.8144 6.21314 7.83961 6.61698 7.16667 7.34639C6.50383 8.06485 6.20655 9.01986 6.20655 10C6.20655 10.9801 6.50383 11.9352 7.16667 12.6536C7.83961 13.383 8.8144 13.7869 10 13.7869C11.1856 13.7869 12.1604 13.383 12.8333 12.6536C13.4962 11.9352 13.7934 10.9801 13.7934 10C13.7934 9.01986 13.4962 8.06485 12.8333 7.34639C12.1604 6.61698 11.1856 6.21314 10 6.21314ZM8.36461 8.44777C8.68478 8.10074 9.19961 7.83891 10 7.83891C10.8004 7.83891 11.3152 8.10074 11.6354 8.44777C11.9657 8.80575 12.1648 9.33776 12.1648 10C12.1648 10.6622 11.9657 11.1943 11.6354 11.5522C11.3152 11.8993 10.8004 12.1611 10 12.1611C9.19961 12.1611 8.68478 11.8993 8.36461 11.5522C8.03435 11.1943 7.83515 10.6622 7.83515 10C7.83515 9.33776 8.03435 8.80575 8.36461 8.44777Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
      />
      <path
        d="M10 2C6.11297 2 3.58698 3.31971 2.04049 5.02671C0.5183 6.7069 0 8.70232 0 10C0 11.2977 0.5183 13.2931 2.04049 14.9733C3.58698 16.6803 6.11297 18 10 18C13.887 18 16.413 16.6803 17.9595 14.9733C19.4817 13.2931 20 11.2977 20 10C20 8.70232 19.4817 6.7069 17.9595 5.02671C16.413 3.31971 13.887 2 10 2ZM3.17925 6.02303C4.40408 4.67107 6.49692 3.49832 10 3.49832C13.5031 3.49832 15.5959 4.67107 16.8208 6.02303C18.0699 7.4018 18.4753 9.03181 18.4753 10C18.4753 10.9682 18.0699 12.5982 16.8208 13.977C15.5959 15.3289 13.5031 16.5017 10 16.5017C6.49692 16.5017 4.40408 15.3289 3.17925 13.977C1.93013 12.5982 1.52468 10.9682 1.52468 10C1.52468 9.03181 1.93013 7.4018 3.17925 6.02303Z"
        fillRule="evenodd"
        clipRule="evenodd"
        fill={color}
      />
    </svg>
  );
}

/**
 * Icon Chỉnh sửa từ Figma Node 1438:11026 (#1440:11107 vuesax/linear/edit)
 * Màu sắc mặc định: #064343 (GymX primary dark green)
 */
export function EditPencilIcon({
  className,
  color = '#064343',
  size = 20,
  width,
  height,
  ...props
}: IconProps) {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M9.16699 1.66699H7.50033C3.33366 1.66699 1.66699 3.33366 1.66699 7.50033V12.5003C1.66699 16.667 3.33366 18.3337 7.50033 18.3337H12.5003C16.667 18.3337 18.3337 16.667 18.3337 12.5003V10.8337"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3666 2.51639L6.7999 9.08306C6.5499 9.33306 6.2999 9.82472 6.2499 10.1831L5.89157 12.6914C5.75823 13.5997 6.3999 14.2331 7.30823 14.1081L9.81657 13.7497C10.1666 13.6997 10.6582 13.4497 10.9166 13.1997L17.4832 6.63306C18.6166 5.49972 19.1499 4.18306 17.4832 2.51639C15.8166 0.849722 14.4999 1.38306 13.3666 2.51639Z"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.4248 3.45801C12.9831 5.44967 14.5415 7.00801 16.5415 7.57467"
        stroke={color}
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Icon Thùng rác Xóa từ Figma Node 1438:11026 (#1438:11028 vuesax/linear/trash)
 * Màu sắc mặc định: #EE464C (Figma coral red)
 */
export function TrashBinIcon({
  className,
  color = '#EE464C',
  size = 20,
  width,
  height,
  ...props
}: IconProps) {
  const iconWidth = width ?? size;
  const iconHeight = height ?? size;

  return (
    <svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M17.5 4.98307C14.725 4.70807 11.9333 4.56641 9.15 4.56641C7.5 4.56641 5.85 4.64974 4.2 4.81641L2.5 4.98307"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.08301 4.14199L7.26634 3.05033C7.39967 2.25866 7.49967 1.66699 8.90801 1.66699H11.0913C12.4997 1.66699 12.608 2.29199 12.733 3.05866L12.9163 4.14199"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.7087 7.61621L15.167 16.0079C15.0753 17.3162 15.0003 18.3329 12.6753 18.3329H7.32533C5.00033 18.3329 4.92533 17.3162 4.83366 16.0079L4.29199 7.61621"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.6084 13.75H11.3834"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.91699 10.417H12.0837"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
