import { Breadcrumb, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import React from 'react';

const { Title } = Typography;

interface PageHeaderProps {
  title: string;
  breadcrumbs?: Array<{ title: string; path?: string }>;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, breadcrumbs = [], actions }: PageHeaderProps) {
  const items = [
    {
      title: (
        <Link to="/">
          <HomeOutlined /> Home
        </Link>
      ),
    },
    ...breadcrumbs.map((item) => ({
      title: item.path ? <Link to={item.path}>{item.title}</Link> : item.title,
    })),
  ];

  return (
    <div className="bg-white p-6 border-b mb-6">
      <div className="flex justify-between items-start">
        <div>
          <Breadcrumb className="mb-4" items={items} />
          <Title level={2} className="!mb-0">
            {title}
          </Title>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  );
}