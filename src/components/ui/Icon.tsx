import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

export type IconName = 
  | 'plus' 
  | 'search' 
  | 'x' 
  | 'settings' 
  | 'trash' 
  | 'import' 
  | 'check' 
  | 'chevron-left'
  | 'pin'
  | 'share'
  | 'trash-2';

interface IconProps extends SvgProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon = ({ 
  name, 
  size = 24, 
  color = 'currentColor', 
  strokeWidth = 2,
  ...props 
}: IconProps) => {
  const renderPath = () => {
    switch (name) {
      case 'plus':
        return <Path d="M12 5l0 14m-7 -7l14 0" />;
      case 'search':
        return (
          <>
            <Path d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" />
            <Path d="M21 21l-6 -6" />
          </>
        );
      case 'x':
        return <Path d="M18 6l-12 12m0 -12l12 12" />;
      case 'settings':
        return (
          <>
            <Path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37a1.724 1.724 0 0 0 2.572 -1.065z" />
            <Path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
          </>
        );
      case 'trash':
      case 'trash-2':
        return (
          <>
            <Path d="M4 7l16 0" />
            <Path d="M10 11l0 6" />
            <Path d="M14 11l0 6" />
            <Path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
            <Path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
          </>
        );
      case 'import':
        return (
          <>
            <Path d="M14 3v4a1 1 0 0 0 1 1h4" />
            <Path d="M5 12v-7a2 2 0 0 1 2 -2h7l5 5v4" />
            <Path d="M7 16.5l3 3l3 -3" />
            <Path d="M10 20.2V12" />
            <Path d="M20 18v1a2 2 0 0 1 -2 2h-1" />
          </>
        );
      case 'check':
        return <Path d="M5 12l5 5l10 -10" />;
      case 'chevron-left':
        return <Path d="M15 6l-6 6l6 6" />;
      case 'pin':
        return <Path d="M15 4l-10 10l-1 5l5 -1l10 -10z" />; // Simplified pin for now
      case 'share':
        return (
          <>
            <Path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
            <Path d="M7 11l5 5l5 -5" />
            <Path d="M12 4l0 12" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {renderPath()}
    </Svg>
  );
};
