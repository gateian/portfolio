import React from 'react';

interface IconWrapperProps {
  color?: string;
  children: React.ReactNode;
}

function IconWrapper({ color = 'currentColor', children }: IconWrapperProps) {
  return (
    <div style={{ color }}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            style: {
              ...child.props.style,
              fill: 'currentColor',
            },
          });
        }
        return child;
      })}
    </div>
  );
}

export default IconWrapper;
