import React, {useState} from 'react'
import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    InputRightAddon,
    InputGroup,
    Alert,
    AlertIcon,
    AlertDescription,
    FormHelperText,
    Textarea,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Link } from 'react-router-dom';
import { useForm } from "react-hook-form";

const CreateNewFund = () => {

    const { handleSubmit, register, formState: { isSubmitting, errors } } = useForm({
        mode: "onChange"
    })
    const [error, setError] = useState("");

    async function onSubmit(data) {
        console.log(
            data.minimumContribution,
            data.FundName,
            data.description,
            data.imageUrl,
            data.target
        );
        // transfer of ether logic will go here
    }

    return (
        <>
        <main>
            <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6} my={20}>
                <Text fontSize={"lg"} color={"teal.400"}>
                    <ArrowBackIcon mr={2} />
                    <Link to="/">Back to Home</Link>
                </Text>

                <Stack>
                    <Heading fontSize={"4xl"}>Create a New Fundraiser 📢</Heading>
                </Stack>

                <Box
                    rounded={"lg"}
                    bg={useColorModeValue("white", "gray.700")}
                    boxShadow={"lg"}
                    p={8}
                >
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={4}>
                            <FormControl id="minimumContribution">
                                <FormLabel>Minimum Contribution Amount</FormLabel>

                                <InputGroup>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...register("minimumContribution", { required: true })}
                                        isDisabled={isSubmitting}
                                        onChange={(e) => {
                                            // setMinContriInUSD(Math.abs(e.target.value));
                                        }}
                                    />

                                    <InputRightAddon children="ETH" />
                                </InputGroup>

                                {/* {minContriInUSD ? (
                                    <FormHelperText>
                                        ~$ {getETHPriceInUSD(ETHPrice, minContriInUSD)}
                                    </FormHelperText>
                                ) : null} */}

                            </FormControl>

                            <FormControl id="FundName">
                                <FormLabel>Fund Name</FormLabel>
                                <Input
                                    {...register("FundName", { required: true })}
                                    isDisabled={isSubmitting}
                                />
                            </FormControl>

                            <FormControl id="description">
                                <FormLabel>Fund Description</FormLabel>
                                <Textarea
                                    {...register("description", { required: true })}
                                    isDisabled={isSubmitting}
                                />
                            </FormControl>

                            <FormControl id="imageUrl">
                                <FormLabel>Image URL</FormLabel>
                                <Input
                                    {...register("imageUrl", { required: true })}
                                    isDisabled={isSubmitting}
                                    type="url"
                                />
                            </FormControl>

                            <FormControl id="target">
                                <FormLabel>Target Amount</FormLabel>
                                <InputGroup>
                                    <Input
                                        type="number"
                                        step="any"
                                        {...register("target", { required: true })}
                                        isDisabled={isSubmitting}
                                        onChange={(e) => {
                                            // setTargetInUSD(Math.abs(e.target.value));
                                            console.log(e);
                                        }}
                                    />
                                    <InputRightAddon children="ETH" />
                                </InputGroup>
                                {/* {targetInUSD ? (
                                    <FormHelperText>
                                        ~$ {getETHPriceInUSD(ETHPrice, targetInUSD)}
                                    </FormHelperText>
                                ) : null} */}
                            </FormControl>

                            {error ? (
                                <Alert status="error">
                                    <AlertIcon />
                                    <AlertDescription mr={2}> {error}</AlertDescription>
                                </Alert>
                            ) : null}

                            {errors.minimumContribution || errors.name || errors.description || errors.imageUrl || errors.target ? (
                                <Alert status="error">
                                    <AlertIcon />
                                    <AlertDescription mr={2}>
                                        {" "}
                                        All Fields are Required
                                    </AlertDescription>
                                </Alert>
                            ) : null}

                            <Stack spacing={10}>

                                {/* conditional rendering if wallet is  connected will come here */}
                                <Stack spacing={3}>
                                    <Button
                                        color={"white"}
                                        bg={"teal.400"}
                                        _hover={{
                                            bg: "teal.300",
                                        }}
                                        onClick={
                                            // () => wallet.connect()
                                            console.log("Hello")
                                        }
                                    >
                                        Connect Wallet{" "}
                                    </Button>
                                    <Alert status="warning">
                                        <AlertIcon />
                                        <AlertDescription mr={2}>
                                            Please Connect Your Wallet First to Create a Fund
                                        </AlertDescription>
                                    </Alert>
                                </Stack>
                            </Stack>
                        </Stack>
                    </form>
                </Box>
            </Stack>       
        </main>
        </>
    )
}

export default CreateNewFund