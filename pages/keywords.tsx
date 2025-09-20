import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';
import MainLayout from '../src/components/layout/MainLayout';
import KeywordAllocationInterface from '../src/components/keywords/KeywordAllocationInterface';
import KeywordRankChecker from '../src/components/keywords/KeywordRankChecker';

export default function Keywords() {
  const [activeTab, setActiveTab] = useState('allocation');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, py: 2, mt: 1 }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          centered
          sx={{ mb: 3, '& .MuiTabs-indicator': { backgroundColor: 'primary.main' } }}
        >
          <Tab
            label="Keyword Allocation"
            value="allocation"
            icon={<CategoryIcon />}
            iconPosition="start"
          />
          <Tab
            label="Rank Checker"
            value="rank-checker"
            icon={<BarChartIcon />}
            iconPosition="start"
          />
        </Tabs>

        <Box>
          {activeTab === 'allocation' && <KeywordAllocationInterface />}
          {activeTab === 'rank-checker' && <KeywordRankChecker />}
        </Box>
      </Box>
    </MainLayout>
  );
}