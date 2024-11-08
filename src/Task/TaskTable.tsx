import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  Input,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { FaCalendarAlt, FaPlus } from "react-icons/fa";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoText } from "react-icons/io5";
import { MdDelete, MdNumbers } from "react-icons/md";
import TagsInput from "react-tagsinput";
import "react-tagsinput/react-tagsinput.css";
import { ColumnDefinition, defaultColumns } from "./Components/columns";
import { useLocalStorage } from "./Components/Hooks/useLocalStorage";
import PopoverActions from "./Components/PopoverActions";
import TableHeader from "./TableHeader";

interface RowData {
  [key: string]: string | number | JSX.Element;
}

type ColumnType = "text" | "number" | "select" | "date";
const columnTypeIcons: Record<ColumnType, JSX.Element> = {
  text: <IoText />,
  number: <MdNumbers />,
  select: <IoIosArrowDropdown />,
  date: <FaCalendarAlt />,
};
const TaskTable = () => {
  const columnTypes: ColumnType[] = ["text", "number", "select", "date"];
  const cellHeight = "40px";
  const [isAddColumnPopoverOpen, setAddColumnPopoverOpen] = useState(false);

  //local Storage
  const [data, setData] = useLocalStorage<RowData[]>("tableData", []);
  const [columns, setColumns] = useLocalStorage<ColumnDefinition[]>(
    "tableColumns",
    defaultColumns
  );
  const [badgeColors, setBadgeColors] = useLocalStorage<Record<string, string>>(
    "badgeColors",
    {}
  );
  const [headingText, setHeadingText] = useLocalStorage("tableHeading", "Database");
  

  const tagColorSchemes = [
    "red",
    "green",
    "blue",
    "purple",
    "yellow",
    "orange",
    "teal",
    "pink",
  ];

  const getRandomColorScheme = (tag: string) => {
    if (!badgeColors[tag]) {
      const newColor =
        tagColorSchemes[Math.floor(Math.random() * tagColorSchemes.length)];
      setBadgeColors((prevColors) => {
        const updatedColors = { ...prevColors, [tag]: newColor };
        localStorage.setItem("badgeColors", JSON.stringify(updatedColors));
        return updatedColors;
      });
      return newColor;
    }
    return badgeColors[tag];
  };
  

  const [isEditing, setIsEditing] = useState<{
    row: number;
    field: string;
  } | null>(null);
  const [filterText, setFilterText] = useState<string>("");
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<boolean[]>([]);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const [tagPopoverRow, setTagPopoverRow] = useState<number | null>(null);


  const [isEditingHeading, setIsEditingHeading] = useState(false);

  const addRow = () => {
    const newRow: RowData = {
      Name: "",
      Tags: "",
      Date: "",
      Status: "",
      number: "",
    };
    setData((prevData) => [...prevData, newRow]);
  };
  const addColumn = (type: string) => {
    // Convert the string to ColumnType, assuming only valid types are passed
    const columnType = type as ColumnType;
    const newColumnName = `New Column ${columns.length + 1}`;
    setColumns((prevColumns) => [
      ...prevColumns,
      { name: newColumnName, type: columnType },
    ]);

    
    setData((prevData) =>
      prevData.map((row) => ({
        ...row,
        [newColumnName]: "", 
      }))
    );

    setAddColumnPopoverOpen(false);
  };
  const handleCellChange = (rowIndex: number, field: string, value: string) => {
    const parsedValue =
      columns.find((col) => col.name === field)?.type === "number"
        ? Number(value) || 0
        : value;
    const updatedData = data.map((row, i) =>
      i === rowIndex ? { ...row, [field]: parsedValue } : row
    );
    setData(updatedData);
  };

  const handleRenameColumn = (index: number, newName: string) => {
    const updatedColumns = [...columns];
    updatedColumns[index].name = newName;
    setColumns(updatedColumns);
    setIsEditing(null);
  };

  const sortColumn = (index: number, order: "asc" | "desc") => {
    const sortedData = [...data].sort((a, b) => {
      const aValue = a[columns[index].name]?.toString() || "";
      const bValue = b[columns[index].name]?.toString() || "";
      return order === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    setData(sortedData);
  };

  const filteredData = data.filter((row) =>
    row["Name"]?.toString().toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    if (isEditing) {
      renameInputRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (filterText) {
      searchInputRef.current?.focus();
    }
  }, [filterText]);

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    setPopoverPosition({ row, col });
  };

  const closePopover = () => {
    setPopoverPosition(null);
  };

  const handleDeleteRow = (rowIndex: number) => {
    setData(data.filter((_, i) => i !== rowIndex));
    closePopover();
  };

  const handleDeleteColumn = (columnIndex: number) => {
    const updatedColumns = columns.filter((_, i) => i !== columnIndex);
    const updatedData = data.map((row) => {
      const { [columns[columnIndex].name]: _, ...remainingRow } = row;
      return remainingRow;
    });
    setColumns(updatedColumns);
    setData(updatedData);
  };

  const handleRowSelect = (rowIndex: number) => {
    const updatedSelection = [...selectedRows];
    updatedSelection[rowIndex] = !updatedSelection[rowIndex];
    setSelectedRows(updatedSelection);
  };

  type ColumnType = "text" | "number" | "select" | "date";

  // Ensure existing tags keep their assigned colors
  const handleTagsInputChange = (rowIndex: number, tags: string[]) => {
    // Ensure existing tags keep their assigned colors
    const updatedBadgeColors = { ...badgeColors };
    tags.forEach((tag) => {
      // Only assign a new color if this tag doesn't already have one in badgeColors
      if (!updatedBadgeColors[tag]) {
        updatedBadgeColors[tag] = getRandomColorScheme(tag);
      }
    });

    // Update the badgeColors state and persist it in localStorage
    setBadgeColors(updatedBadgeColors);
    localStorage.setItem("badgeColors", JSON.stringify(updatedBadgeColors));

    // Update the tags data for the row
    const updatedData = data.map((row, i) =>
      i === rowIndex ? { ...row, Tags: tags.join(", ") } : row
    );
    setData(updatedData);
  };

  const handleRowDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;  
    const reorderedData = Array.from(data);
    const [movedRow] = reorderedData.splice(source.index, 1);
    reorderedData.splice(destination.index, 0, movedRow);
  
    setData(reorderedData);  // Update data with reordered list
  };
  


  

  return (
    <Box p={4} rounded="md" display="flex" justifyContent="center" mt={'50px'}>
      <VStack
        width="100%"
        align="start"
        spacing={4}
        marginLeft={"100px"}
        paddingRight={"100px"}
      >
        <Box width="100%" overflowY="auto" minHeight={"800px"}>
          <Box ml={"30px"}>
            {isEditingHeading ? (
              <Input
                ref={renameInputRef}
                value={headingText}
                onChange={(e) => setHeadingText(e.target.value)}
                onBlur={() => setIsEditingHeading(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingHeading(false);
                }}
                fontSize="4xl"
                fontWeight="bold"
                variant="unstyled"
                padding="0"
                width="auto"
                autoFocus
              />
            ) : (
              <Text
                fontSize="4xl"
                fontWeight="bold"
                onClick={() => setIsEditingHeading(true)}
                cursor="pointer"
              >
                {headingText}
              </Text>
            )}
          </Box>
          <DragDropContext onDragEnd={handleRowDragEnd}>
            <Droppable droppableId="tableRows" type="row">
              {(provided) => (
                <Table
                  variant="simple"
                  colorScheme="gray"
                  borderWidth="0"
                  maxWidth="100%"
                  size="sm"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <TableHeader
                    columns={columns}
                    setColumns={setColumns}
                    isAddColumnPopoverOpen={isAddColumnPopoverOpen}
                    setAddColumnPopoverOpen={setAddColumnPopoverOpen}
                    columnTypes={columnTypes}
                    columnTypeIcons={columnTypeIcons}
                    addColumn={addColumn}
                    sortColumn={sortColumn}
                    setFilterText={setFilterText}
                    handleRenameColumn={handleRenameColumn}
                    handleDeleteColumn={handleDeleteColumn}
                  />
                  <Tbody>
                    {filteredData.map((row, rowIndex) => (
                      <Draggable
                        key={rowIndex}
                        draggableId={`row-${rowIndex}`}
                        index={rowIndex}
                      >
                        {(provided) => (
                          <Tr
                            key={rowIndex}
                            onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                            onMouseLeave={() => setHoveredRowIndex(null)}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Td borderBottom="0px">
                              <Flex
                                justifyContent="flex-start"
                                alignItems="center"
                              >
                                {hoveredRowIndex === rowIndex && (
                                  <>
                                    <HStack
                                      position={"absolute"}
                                      left={"2%"}
                                      spacing={5}
                                    >
                                      <Box
                                        onClick={addRow}
                                        bg="none"
                                        color="gray.400"
                                        p={0}
                                      >
                                        <FaPlus fontSize={"20px"} />
                                      </Box>
                                      <Box
                                        onClick={() =>
                                          handleDeleteRow(rowIndex)
                                        }
                                        bg="none"
                                        color="gray.400"
                                      >
                                        <MdDelete fontSize={"20px"} />
                                      </Box>
                                      <Checkbox
                                        isChecked={selectedRows[rowIndex]}
                                        onChange={() =>
                                          handleRowSelect(rowIndex)
                                        }
                                      />
                                    </HStack>
                                  </>
                                )}
                              </Flex>
                            </Td>
                            {columns.map((col, colIndex) => (
                              <Td
                                key={colIndex}
                                borderLeftWidth={colIndex === 0 ? "0" : "1px"}
                                px={1}
                                py={0.5}
                                height={cellHeight}
                                width={"25%"}
                                position="relative"
                                onContextMenu={(e) =>
                                  handleRightClick(e, rowIndex, colIndex)
                                }
                              >
                                {isEditing?.row === rowIndex &&
                                isEditing.field === col.name ? (
                                  col.name === "Tags" ? (
                                    <Popover
                                      isOpen={tagPopoverRow === rowIndex}
                                      onClose={() => setTagPopoverRow(null)}
                                      placement="bottom-start"
                                    >
                                      <PopoverTrigger>
                                        <Box
                                          onClick={() =>
                                            setTagPopoverRow(rowIndex)
                                          }
                                          cursor="pointer"
                                          minHeight={cellHeight}
                                          width="100%"
                                        >
                                          <Flex wrap="wrap" gap="4px">
                                            {row[col.name]
                                              ?.toString()
                                              .split(",")
                                              .filter((tag) => tag)
                                              .map((tag, i) => (
                                                <Badge
                                                  padding={1}
                                                  borderRadius={4}
                                                  key={i}
                                                  colorScheme={
                                                    badgeColors[tag] ||
                                                    getRandomColorScheme(tag)
                                                  }
                                                  variant="solid"
                                                >
                                                  {tag.trim()}
                                                </Badge>
                                              ))}
                                          </Flex>
                                        </Box>
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
                                        <PopoverBody>
                                          <TagsInput
                                            value={
                                              row[col.name]
                                                ?.toString()
                                                .split(",")
                                                .filter(Boolean) || []
                                            }
                                            onChange={(tags) =>
                                              handleTagsInputChange(
                                                rowIndex,
                                                tags
                                              )
                                            }
                                            inputProps={{
                                              placeholder: "Add tags",
                                              autoFocus: true,
                                              style: {
                                                backgroundColor: "gray.200",
                                              }, // Set gray background
                                            }}
                                          />
                                        </PopoverBody>
                                      </PopoverContent>
                                    </Popover>
                                  ) : col.type === "text" ? (
                                    <Input
                                      value={
                                        typeof row[col.name] === "string" ||
                                        typeof row[col.name] === "number"
                                          ? row[col.name].toString()
                                          : undefined
                                      }
                                      onBlur={() => setIsEditing(null)}
                                      onChange={(e) =>
                                        handleCellChange(
                                          rowIndex,
                                          col.name,
                                          e.target.value
                                        )
                                      }
                                      autoFocus
                                      size="sm"
                                      height={cellHeight}
                                      width="100%"
                                    />
                                  ) : col.type === "number" ? (
                                    <Input
                                      type="number"
                                      value={
                                        col.type === "number" &&
                                        typeof row[col.name] === "number"
                                          ? row[col.name].toString()
                                          : ""
                                      }
                                      onBlur={() => setIsEditing(null)}
                                      onChange={(e) =>
                                        handleCellChange(
                                          rowIndex,
                                          col.name,
                                          e.target.value
                                        )
                                      }
                                      autoFocus
                                      size="sm"
                                      height={cellHeight}
                                      width="100%"
                                    />
                                  ) : col.type === "date" ? (
                                    <Input
                                      type="date"
                                      value={
                                        typeof row[col.name] === "string" ||
                                        typeof row[col.name] === "number"
                                          ? row[col.name].toString()
                                          : undefined
                                      }
                                      onBlur={() => setIsEditing(null)}
                                      onChange={(e) =>
                                        handleCellChange(
                                          rowIndex,
                                          col.name,
                                          e.target.value
                                        )
                                      }
                                      autoFocus
                                      size="sm"
                                      height={cellHeight}
                                      width="100%"
                                    />
                                  ) : col.type === "select" ? (
                                    <Select
                                      value={row[col.name] as string}
                                      onBlur={() => setIsEditing(null)}
                                      onChange={(e) =>
                                        handleCellChange(
                                          rowIndex,
                                          col.name,
                                          e.target.value
                                        )
                                      }
                                      autoFocus
                                      size="sm"
                                      height={cellHeight}
                                      width="100%"
                                    >
                                      <option value="">Select an option</option>
                                      <option value="Option 1">Option 1</option>
                                      <option value="Option 2">Option 2</option>
                                      <option value="Option 3">Option 3</option>
                                    </Select>
                                  ) : null
                                ) : (
                                  <Box
                                    onClick={() =>
                                      setIsEditing({
                                        row: rowIndex,
                                        field: col.name,
                                      })
                                    }
                                    h="100%"
                                    display="flex"
                                    alignItems="center"
                                  >
                                    {col.name === "Tags" ? (
                                      <Flex wrap="wrap" gap="4px">
                                        {row[col.name]
                                          ?.toString()
                                          .split(",")
                                          .filter((tag) => tag)
                                          .map((tag, i) => (
                                            <Badge
                                              padding={1}
                                              borderRadius={4}
                                              key={i}
                                              colorScheme={
                                                badgeColors[tag] ||
                                                getRandomColorScheme(tag)
                                              }
                                              variant="solid"
                                            >
                                              {tag.trim()}
                                            </Badge>
                                          ))}
                                      </Flex>
                                    ) : (
                                      <Text>{row[col.name]}</Text>
                                    )}
                                  </Box>
                                )}
                              </Td>
                            ))}
                            <Td borderLeftWidth="1px"></Td>
                          </Tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Tbody>
                  {popoverPosition && (
                    <PopoverActions
                      isOpen={popoverPosition !== null}
                      onClose={closePopover}
                      rowIndex={popoverPosition.row}
                      handleDeleteRow={handleDeleteRow}
                    />
                  )}
                  <Tr>
                    <Td borderWidth={"0"}></Td>
                    <Td colSpan={columns.length + 1} textAlign="center">
                      <VStack align={"flex-start"}>
                        <Button
                          variant="ghost"
                          color="gray.400"
                          onClick={addRow}
                        >
                          + New Page
                        </Button>
                      </VStack>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td borderWidth="0"></Td>
                    <Text mt={2} color="gray.500" textAlign="right">
                      Count: {filteredData.length}
                    </Text>
                  </Tr>
                </Table>
              )}
            </Droppable>
          </DragDropContext>
        </Box>
      </VStack>
    </Box>
  );
};

export default TaskTable;
