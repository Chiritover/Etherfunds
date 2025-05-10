import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  VStack,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import EtherFundABI from '../backend/artifacts/contracts/EtherFund.sol/EtherFund.json';

const CampaignDashboard = ({ contractAddress, campaignId }) => {
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [disbursements, setDisbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const cardBg = useColorModeValue('white', 'gray.700');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Connect to Ethereum
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, EtherFundABI.abi, provider);

        // Get campaign data
        const c = await contract.campaigns(campaignId);
        setCampaign({
          goal: ethers.utils.formatEther(c.goal),
          raised: ethers.utils.formatEther(c.balance),
          donors: c.contributorCount.toNumber(),
        });

        // Get donation events
        const donationFilter = contract.filters.DonationReceived(campaignId);
        const donationEvents = await contract.queryFilter(donationFilter);
        setDonations(donationEvents.map(e => ({
          donor: e.args.donor,
          amount: ethers.utils.formatEther(e.args.amount),
          timestamp: new Date(e.args.timestamp.toNumber() * 1000),
          tx: e.transactionHash,
        })));

        // Get disbursement events
        const disburseFilter = contract.filters.FundsDisbursed(campaignId);
        const disburseEvents = await contract.queryFilter(disburseFilter);
        setDisbursements(disburseEvents.map(e => ({
          recipient: e.args.recipient,
          amount: ethers.utils.formatEther(e.args.amount),
          timestamp: new Date(e.args.timestamp.toNumber() * 1000),
          tx: e.transactionHash,
        })));
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }
    fetchData();
  }, [campaignId, contractAddress]);

  if (loading) return <Spinner size="xl" />;
  if (!campaign) return <Text>No campaign data found.</Text>;

  const progress = (parseFloat(campaign.raised) / parseFloat(campaign.goal)) * 100;

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Campaign Dashboard</Heading>
        <Grid templateColumns="repeat(3, 1fr)" gap={6}>
          <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
            <Stat>
              <StatLabel>Total Raised</StatLabel>
              <StatNumber>{campaign.raised} ETH</StatNumber>
              <StatHelpText>Goal: {campaign.goal} ETH</StatHelpText>
            </Stat>
            <Progress value={progress} mt={4} colorScheme="green" />
          </Box>
          <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
            <Stat>
              <StatLabel>Unique Donors</StatLabel>
              <StatNumber>{campaign.donors}</StatNumber>
              <StatHelpText>Total Contributors</StatHelpText>
            </Stat>
          </Box>
          <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
            <Stat>
              <StatLabel>Progress</StatLabel>
              <StatNumber>{progress.toFixed(2)}%</StatNumber>
              <StatHelpText>Goal Achievement</StatHelpText>
            </Stat>
          </Box>
        </Grid>
        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
            <Heading size="md" mb={4}>Recent Donations</Heading>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Donor</Th>
                  <Th>Amount</Th>
                  <Th>Date</Th>
                  <Th>Tx</Th>
                </Tr>
              </Thead>
              <Tbody>
                {donations.slice(0, 5).map((d, i) => (
                  <Tr key={i}>
                    <Td>{d.donor.slice(0, 6)}...{d.donor.slice(-4)}</Td>
                    <Td>{d.amount} ETH</Td>
                    <Td>{d.timestamp.toLocaleDateString()}</Td>
                    <Td><a href={`https://etherscan.io/tx/${d.tx}`} target="_blank" rel="noopener noreferrer">View</a></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
            <Heading size="md" mb={4}>Disbursement Timeline</Heading>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Recipient</Th>
                  <Th>Amount</Th>
                  <Th>Date</Th>
                  <Th>Tx</Th>
                </Tr>
              </Thead>
              <Tbody>
                {disbursements.slice(0, 5).map((d, i) => (
                  <Tr key={i}>
                    <Td>{d.recipient.slice(0, 6)}...{d.recipient.slice(-4)}</Td>
                    <Td>{d.amount} ETH</Td>
                    <Td>{d.timestamp.toLocaleDateString()}</Td>
                    <Td><a href={`https://etherscan.io/tx/${d.tx}`} target="_blank" rel="noopener noreferrer">View</a></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Grid>
        <Box bg={cardBg} p={4} borderRadius="md" boxShadow="md">
          <Heading size="md" mb={4}>Audit Log</Heading>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Type</Th>
                <Th>From/To</Th>
                <Th>Amount</Th>
                <Th>Date</Th>
                <Th>Tx</Th>
              </Tr>
            </Thead>
            <Tbody>
              {donations.map((d, i) => (
                <Tr key={`donation-${i}`}>
                  <Td>Donation</Td>
                  <Td>{d.donor.slice(0, 6)}...{d.donor.slice(-4)}</Td>
                  <Td>{d.amount} ETH</Td>
                  <Td>{d.timestamp.toLocaleDateString()}</Td>
                  <Td><a href={`https://etherscan.io/tx/${d.tx}`} target="_blank" rel="noopener noreferrer">View</a></Td>
                </Tr>
              ))}
              {disbursements.map((d, i) => (
                <Tr key={`disburse-${i}`}>
                  <Td>Disbursement</Td>
                  <Td>{d.recipient.slice(0, 6)}...{d.recipient.slice(-4)}</Td>
                  <Td>{d.amount} ETH</Td>
                  <Td>{d.timestamp.toLocaleDateString()}</Td>
                  <Td><a href={`https://etherscan.io/tx/${d.tx}`} target="_blank" rel="noopener noreferrer">View</a></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};

export default CampaignDashboard; 