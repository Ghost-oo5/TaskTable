import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogOverlay,
  Button,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Switch,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FaArrowDown, FaArrowUp, FaPlus, FaSearch } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import {
  ColumnDefinition,
  ColumnType,
  iconTypeMapping,
} from "./Components/columns";
import { useLocalStorage } from "./Components/Hooks/useLocalStorage";

interface TableHeaderProps {
  columns: ColumnDefinition[];
  setColumns: React.Dispatch<React.SetStateAction<ColumnDefinition[]>>;
  columnTypeIcons: Record<string, React.ReactElement | undefined>;
  isAddColumnPopoverOpen: boolean;
  setAddColumnPopoverOpen: (open: boolean) => void;
  columnTypes: string[];
  addColumn: (type: string) => void;
  sortColumn: (index: number, order: "asc" | "desc") => void;
  setFilterText: (text: string) => void;
  handleRenameColumn: (index: number, newName: string) => void;
  handleDeleteColumn: (index: number) => void;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  setColumns,
  isAddColumnPopoverOpen,
  setAddColumnPopoverOpen,
  columnTypes,
  columnTypeIcons,
  sortColumn,
  setFilterText,
  handleRenameColumn,
  // handleDeleteColumn,
}) => {
  const [localColumns, setLocalColumns] = useLocalStorage<ColumnDefinition[]>(
    "columns",
    columns
  );

  const [newColumnName, setNewColumnName] = useState<string>("");
  const [newColumnType, setNewColumnType] = useState<string>("");

  const {
    isOpen: isDeleteConfirmationOpen,
    onOpen: onDeleteConfirmationOpen,
    onClose: onDeleteConfirmationClose,
  } = useDisclosure();

  const [columnToDelete, setColumnToDelete] = useState<number | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const onColumnDragEnd = (result: any) => {
    const { destination, source } = result;

    if (!destination) return;

    // Reorder columns based on drag result
    const reorderedColumns = Array.from(localColumns);
    const [movedColumn] = reorderedColumns.splice(source.index, 1);
    reorderedColumns.splice(destination.index, 0, movedColumn);

    // Update state with reordered columns
    setLocalColumns(reorderedColumns);
    setColumns(reorderedColumns);
  };

  const handleAddNewColumn = (type: string) => {
    const columnName =
      newColumnName || `${type.charAt(0).toUpperCase() + type.slice(1)}`;
    const columnType = type || "text";

    const newColumn: ColumnDefinition = {
      name: columnName,
      type: columnType as ColumnType,
      iconType: columnType,
    };

    const updatedColumns = [...localColumns, newColumn];
    setLocalColumns(updatedColumns);
    setColumns(updatedColumns);

    setNewColumnName("");
    setNewColumnType("");
    setAddColumnPopoverOpen(false);
  };

  const handleDeleteColumnLocal = (index: number) => {
    setColumnToDelete(index);
    onDeleteConfirmationOpen();
  };

  const confirmDeleteColumn = () => {
    if (columnToDelete !== null) {
      const updatedColumns = localColumns.filter((_, i) => i !== columnToDelete);
      setLocalColumns(updatedColumns);
      setColumns(updatedColumns);
    }
    onDeleteConfirmationClose();
  };

  return (
    <DragDropContext onDragEnd={onColumnDragEnd}>
      <Droppable droppableId="columns" direction="horizontal" type="column">
        {(provided) => (
          <Thead
            borderTopWidth="0"
            position="sticky"
            top="0"
            zIndex="1"
            boxShadow="sm"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <Tr>
              <Th borderWidth="0"></Th>

              {localColumns.map((col, index) => (
                <Draggable
                  key={col.name}
                  draggableId={`column-${col.name}`}
                  index={index}
                >
                  {(provided) => (
                    <Th
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      color="gray.400"
                      fontSize="md"
                      borderLeftWidth={index === 0 ? "0" : "1px"}
                      paddingY={1}
                    >
                      <Popover>
                        <PopoverTrigger>
                          <HStack
                            spacing={1}
                            cursor="pointer"
                            fontSize={"14px"}
                          >
                            {col.iconType && iconTypeMapping[col.iconType]}
                            <Text fontWeight={"normal"} ml={1}>
                              {col.name}
                            </Text>
                          </HStack>
                        </PopoverTrigger>
                        <PopoverContent
                          
                          color="gray.400"
                          borderRadius="lg"
                          boxShadow="lg"
                          px={0}
                          width={"250px"}
                          minWidth="200px"
                        >
                          <PopoverBody>
                            <VStack align={"flex-start"} spacing={2}>
                              <HStack
                                marginTop={2}
                                fontWeight={"normal"}
                                py={0}
                              >
                                <Button height={"28px"}>Aa</Button>
                                <Input
                                  fontSize={"14px"}
                                  px={2}
                                  height={"28px"}
                                  placeholder="Rename column"
                                  defaultValue={col.name}
                                  onBlur={(e) =>
                                    handleRenameColumn(
                                      index,
                                      e.currentTarget.value
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      handleRenameColumn(
                                        index,
                                        e.currentTarget.value
                                      );
                                  }}
                                />
                              </HStack>
                              <Button
                                py={0}
                                my={0}
                                leftIcon={<FaArrowUp />}
                                onClick={() => sortColumn(index, "asc")}
                                size="sm"
                                variant="ghost"
                                color="gray.400"
                                justifyContent="start"
                                _hover={{ bg: "gray.600" }}
                              >
                                <Text fontWeight={"normal"}>
                                  Sort Ascending
                                </Text>
                              </Button>
                              <Button
                                py={0}
                                my={0}
                                leftIcon={<FaArrowDown />}
                                onClick={() => sortColumn(index, "desc")}
                                size="sm"
                                variant="ghost"
                                color="gray.400"
                                justifyContent="start"
                                _hover={{ bg: "gray.600" }}
                              >
                                <Text fontWeight={"normal"}>
                                  Sort Descending
                                </Text>
                              </Button>

                              <InputGroup mb={2}>
                                <InputLeftElement
                                  pointerEvents="none"
                                  fontSize={"12px"}
                                  height={"28px"}
                                >
                                  <FaSearch color="gray.300" />
                                </InputLeftElement>
                                <Input
                                  fontSize={"14px"}
                                  px={2}
                                  height={"28px"}
                                  type="tel"
                                  placeholder="Search"
                                  onChange={(e) =>
                                    setFilterText(e.target.value)
                                  }
                                />
                              </InputGroup>
                              <HStack
                                justifyContent={"space-between"}
                                fontSize={"14px"}
                                fontWeight={"normal"}
                                ml={4}
                              >
                                <Text textTransform={"capitalize"}>
                                  Wrap Column
                                </Text>
                                <Switch colorScheme="teal" />
                              </HStack>
                              <Button
                                leftIcon={<MdDelete />}
                                fontSize={"15px"}
                                fontWeight={"normal"}
                                marginTop={0}
                                size="sm"
                                variant="ghost"
                                justifyContent="start"
                                _hover={{ color: "red.500" }}
                                onClick={() => handleDeleteColumnLocal(index)}
                              >
                                <Text>Delete Property</Text>
                              </Button>
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </Th>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}

              <Th borderLeftWidth="1px" borderTopWidth="0">
                <Popover
                  isOpen={isAddColumnPopoverOpen}
                  onClose={() => setAddColumnPopoverOpen(false)}
                >
                  <PopoverTrigger>
                    <IconButton
                      aria-label="Add Column"
                      icon={<FaPlus />}
                      size="sm"
                      variant="ghost"
                      color="white"
                      onClick={() => setAddColumnPopoverOpen(true)}
                    />
                  </PopoverTrigger>
                  <PopoverContent
                    bg="#252525"
                    color="gray.200"
                    borderRadius="lg"
                    boxShadow="lg"
                    p={3}
                    width={"250px"}
                    minWidth="200px"
                  >
                    <VStack>
                      <Input
                        fontSize={"14px"}
                        px={2}
                        height={"28px"}
                        placeholder="Enter Column Name"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                      />
                      {columnTypes.map((type, index) => (
                        <Button
                          justifyContent={"flex-start"}
                          p={0}
                          pl={1}
                          leftIcon={columnTypeIcons[type]}
                          fontSize={"14px"}
                          fontWeight={"normal"}
                          bg={newColumnType === type ? "gray.600" : "none"}
                          width={"100%"}
                          key={index}
                          onClick={() => {
                            setNewColumnType(type);
                            handleAddNewColumn(type);
                          }}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}{" "}
                        </Button>
                      ))}
                    </VStack>
                  </PopoverContent>
                </Popover>
              </Th>
            </Tr>
          </Thead>
        )}
      </Droppable>
      <AlertDialog isOpen={isDeleteConfirmationOpen} onClose={onDeleteConfirmationClose}  leastDestructiveRef={cancelRef}>
        <AlertDialogOverlay>
          <AlertDialogContent bg={'#252525'} width={'400px'} paddingY={'20px'}>
            <AlertDialogBody textAlign={'center'}>
              Are you sure you want to delete this column? <b>This action cannot be undone.</b>
            </AlertDialogBody>
            <AlertDialogFooter
             display="flex"
             flexDirection="column"
             alignItems="center"
             gap={2}>
              <Button variant={'outline'}  colorScheme="red" 
          onClick={confirmDeleteColumn}
          width="100%">
                Delete
              </Button>
              <Button onClick={onDeleteConfirmationClose} width="100%">Cancel</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </DragDropContext>
  );
};

export default TableHeader;
