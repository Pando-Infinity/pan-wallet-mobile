import React from 'react';
import Icons from '../../constants/icons';
import { CustomImage } from 'components/common';

export const AvatarView = ({ size, image }) => {
  return (
    <CustomImage
      imageUrl={image}
      defaultSource={Icons.defaultTokenImage}
      style={{ height: size, width: size, borderRadius: size }}
    />
  );
};
