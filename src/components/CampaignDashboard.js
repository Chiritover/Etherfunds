import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  VStack,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
} from '@chakra-ui/react';
import { useContract } from '../hooks/useContract';
import { formatEther } from 'ethers/lib/utils';

const CampaignDashboard = ({ campaignId }) => {
  const [campaignData, setCampaignData] = useState(null);
  const [donations, setDonations] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const contract = useContract();
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    loadCampaignData();
    loadDonations();
    loadDisbursements();
  }, [campaignId]);

  const loadCampaignData = async () => {
    try {
      const campaign = await contract.campaigns(campaignId);
      setCampaignData({
        goal: formatEther(campaign.goal),
        raised: formatEther(campaign.raised),
        donors: campaign.donorsCount.toNumber(),
      });
    } catch (error) {
      console.error('Error loading campaign data:', error);
    }
  };

  const loadDonations = async () => {
    try {
      const filter = contract.filters.DonationReceived(campaignId);
      const events = await contract.queryFilter(filter);
      
      const donationsData = events.map(event => ({
        donor: event.args.donor,
        amount: formatEther(event.args.amount),
        timestamp: event.args.timestamp.toNumber(),
        transactionHash: event.transactionHash,
      }));
      
      setDonations(donationsData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading donations:', error);
    }
  };

  const loadDisbursements = async () => {
    try {
      const filter = contract.filters.FundsDisbursed(campaignId);
      const events = await contract.queryFilter(filter);
      
      const disbursementsData = events.map(event => ({
        amount: formatEther(event.args.amount),
        recipient: event.args.recipient,
        timestamp: event.args.timestamp.toNumber(),
        transactionHash: event.transactionHash,
      }));
      
      setDisbursements(disbursementsData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading disbursements:', error);
    }
  };

  if (!campaignData) return null;

  const progress = (parseFloat(campaignData.raised) / parseFloat(campaignData.goal)) * 100;

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Campaign Dashboard</Heading>

        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Total Raised</StatLabel>
                <StatNumber>{campaignData.raised} ETH</StatNumber>
                <StatHelpText>Goal: {campaignData.goal} ETH</StatHelpText>
              </Stat>
              <Progress value={progress} mt={4} colorScheme="green" />
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Unique Donors</StatLabel>
                <StatNumber>{campaignData.donors}</StatNumber>
                <StatHelpText>Total Contributors</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Stat>
                <StatLabel>Progress</StatLabel>
                <StatNumber>{progress.toFixed(2)}%</StatNumber>
                <StatHelpText>Goal Achievement</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <Card bg={cardBg}>
            <CardBody>
              <Heading size="md" mb={4}>Recent Donations</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Donor</Th>
                    <Th>Amount</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {donations.slice(0, 5).map((donation, index) => (
                    <Tr key={index}>
                      <Td>{`${donation.donor.slice(0, 6)}...${donation.donor.slice(-4)}`}</Td>
                      <Td>{donation.amount} ETH</Td>
                      <Td>{new Date(donation.timestamp * 1000).toLocaleDateString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <Heading size="md" mb={4}>Recent Disbursements</Heading>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Recipient</Th>
                    <Th>Amount</Th>
                    <Th>Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {disbursements.slice(0, 5).map((disbursement, index) => (
                    <Tr key={index}>
                      <Td>{`${disbursement.recipient.slice(0, 6)}...${disbursement.recipient.slice(-4)}`}</Td>
                      <Td>{disbursement.amount} ETH</Td>
                      <Td>{new Date(disbursement.timestamp * 1000).toLocaleDateString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </Grid>
      </VStack>
    </Box>
  );
};

export default CampaignDashboard; 