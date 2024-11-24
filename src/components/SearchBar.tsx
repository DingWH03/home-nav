import React, { useState } from "react";
import { HStack, Input, Button, InputGroup, InputRightElement } from "@chakra-ui/react";

interface SearchBarProps {
  onLocalSearch: (query: string) => void;
  onExternalSearch: (query: string, engine: "bing" | "google") => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onLocalSearch, onExternalSearch }) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchEngine, setSearchEngine] = useState<"bing" | "google">("bing");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onExternalSearch(searchQuery, searchEngine);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onLocalSearch(query); // 实时触发本地搜索
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      handleSearch();
    }
  };

  return (
    <HStack width="100%" padding="10px" bgColor="var(--main-bg-color)" borderBottom="1px solid #e2e8f0">
      <InputGroup>
        <Input
          placeholder="搜索我的收藏或输入关键字进行外部搜索"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress} // 添加按键监听事件
        />
        <InputRightElement>
          <Button size="sm" colorScheme="blue" onClick={handleSearch} disabled={!searchQuery.trim()}>
            搜索
          </Button>
        </InputRightElement>
      </InputGroup>
      <HStack spacing={2}>
        <Button
          size="sm"
          variant={searchEngine === "bing" ? "solid" : "outline"}
          onClick={() => setSearchEngine("bing")}
        >
          Bing
        </Button>
        <Button
          size="sm"
          variant={searchEngine === "google" ? "solid" : "outline"}
          onClick={() => setSearchEngine("google")}
        >
          Google
        </Button>
      </HStack>
    </HStack>
  );
};

export default SearchBar;
