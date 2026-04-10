import React from 'react';

type TileProps = {
  title: string;
  description: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
  icon?: React.ReactNode;
};

export default function Tile({ title, description, icon, bgColor, textColor, className }: TileProps) {
  return (
    <div className={`py-8 px-6 min-h-72 border-slate-100 border-2 border-solid rounded-xl shadow-sm ${bgColor ? bgColor : ''} ${textColor ? textColor : 'text-slate-800'} ${className ? className : ''}`}>
      {icon ? icon : null}
      <h2 className='text-2xl font-semibold mb-2 min-h-16 leading-8'>{title}</h2>
      <p className='text-lg max-w-sm min-h-24'>{description}</p>
    </div>
  );
}
