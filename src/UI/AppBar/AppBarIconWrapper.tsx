import React from "react";

interface IconWrapperProps {
  color?: string;
  children: React.ReactNode;
}

const IconWrapper = ({
  color = "currentColor",
  children,
}: IconWrapperProps) => {
  return (
    <div style={{ color: color }}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            style: {
              ...child.props.style,
              fill: "currentColor",
            },
          });
        }
        return child;
      })}
    </div>
  );
};

export default IconWrapper;
