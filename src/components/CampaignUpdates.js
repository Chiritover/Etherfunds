import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Textarea,
  useToast,
  Card,
  CardBody,
  Stack,
  StackDivider,
} from '@chakra-ui/react';
import { useContract } from '../hooks/useContract';
import { uploadToIPFS, getFromIPFS } from '../lib/ipfs';

const CampaignUpdates = ({ campaignId }) => {
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const contract = useContract();

  useEffect(() => {
    loadUpdates();
  }, [campaignId]);

  const loadUpdates = async () => {
    try {
      const filter = contract.filters.CampaignUpdate(campaignId);
      const events = await contract.queryFilter(filter);
      
      const updatesData = await Promise.all(
        events.map(async (event) => {
          const ipfsData = await getFromIPFS(event.args.ipfsHash);
          return {
            ...ipfsData,
            timestamp: event.args.timestamp.toNumber(),
            transactionHash: event.transactionHash,
          };
        })
      );
      
      setUpdates(updatesData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading updates:', error);
      toast({
        title: 'Error loading updates',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleSubmitUpdate = async () => {
    if (!newUpdate.trim()) return;
    
    setLoading(true);
    try {
      const updateData = {
        content: newUpdate,
        timestamp: Date.now(),
      };
      
      const ipfsHash = await uploadToIPFS(updateData);
      const tx = await contract.addCampaignUpdate(campaignId, ipfsHash);
      await tx.wait();
      
      setNewUpdate('');
      await loadUpdates();
      
      toast({
        title: 'Update posted successfully',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error posting update:', error);
      toast({
        title: 'Error posting update',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Heading size="md">Campaign Updates</Heading>
        
        <Box>
          <Textarea
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            placeholder="Share an update about your campaign..."
            mb={2}
          />
          <Button
            colorScheme="blue"
            onClick={handleSubmitUpdate}
            isLoading={loading}
            isDisabled={!newUpdate.trim()}
          >
            Post Update
          </Button>
        </Box>

        <Stack spacing={4}>
          {updates.map((update, index) => (
            <Card key={index}>
              <CardBody>
                <Stack divider={<StackDivider />} spacing={4}>
                  <Text>{update.content}</Text>
                  <Text fontSize="sm" color="gray.500">
                    Posted on {new Date(update.timestamp * 1000).toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Transaction: {update.transactionHash}
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Stack>
      </VStack>
    </Box>
  );
};

export default CampaignUpdates; 