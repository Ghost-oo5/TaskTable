import {
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Button,
    VStack,
    Box,
  } from "@chakra-ui/react";
  import { MdDelete } from "react-icons/md";
  
  interface PopoverActionsProps {
    isOpen: boolean;
    onClose: () => void;
    rowIndex: number;
    handleDeleteRow: (index: number) => void;
  }
  
  const PopoverActions = ({
    isOpen,
    onClose,
    rowIndex,
    handleDeleteRow,
  }: PopoverActionsProps) => {
    return (
      <Popover isOpen={isOpen} onClose={onClose}>
        <PopoverTrigger>
          <Box></Box>
        </PopoverTrigger>
        <PopoverContent
          width={"200px"}
          bg="gray.800"
          color="white"
          borderRadius="lg"
          boxShadow="lg"
          minWidth="100px"
          border="1px solid"
          borderColor="gray.600"
        >
          <PopoverBody padding="0">
            <VStack align="stretch" spacing="1px">
              <Button
                leftIcon={<MdDelete />}
                fontSize="md"
                size="sm"
                variant="ghost"
                color="whiteAlpha.900"
                justifyContent="start"
                paddingY={4}
                _hover={{ bg: "gray.700" }}
                onClick={() => handleDeleteRow(rowIndex)}
              >
                Delete
              </Button>
            </VStack>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  };
  
  export default PopoverActions;
  