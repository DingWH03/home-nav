import { resource, ResourceItem } from "src/server";
import { Box, HStack, VStack, Text, Image, useToast, Link } from "@chakra-ui/react";
import ResourcePanel from "./resourcePanel";
import { RounderBox, H2 } from "src/components/primitives"
import React, { useEffect, useState } from "react";
import { myCollectionTableName, getDb, isSupportIndexDB } from "src/util/indexDB";
import AddResourceDrawer from "./addResourceDrawer";
import SearchBar from "./SearchBar";

export const MyCollectionContext = React.createContext<{
    setMyCollection: React.Dispatch<React.SetStateAction<ResourceItem[]>>
}>({
    setMyCollection: () => { }
});

const Content = () => {
    const [myCollection, setMyCollection] = useState<ResourceItem[]>([]);
    const [filteredCollection, setFilteredCollection] = useState<ResourceItem[]>([]);
    const [addResourceModalOpen, setAddResourceModalOpen] = useState<boolean>(false);
    const toast = useToast();

    const updateMyCollection = () => {
        if (isSupportIndexDB()) {
            getDb().then((db) => {
                db.readAll(myCollectionTableName).then((res) => {
                    if (res) {
                        setMyCollection(res as ResourceItem[]); // 更新原始数据
                        if (filteredCollection.length === 0) { // 仅在初始加载时同步
                            setFilteredCollection(res as ResourceItem[]);
                        }
                    }
                });
            });
        }
    };
    

    useEffect(() => {
        updateMyCollection();
    }, []);

    useEffect(() => {
        console.log("Filtered Collection Updated:", filteredCollection);
    }, [filteredCollection]);
    

    const handleLocalSearch = async (query: string) => {
        if (isSupportIndexDB()) {
            const db = await getDb();
            const allResources = await db.readAll(myCollectionTableName);
    
            if (allResources) {
                const filtered = (allResources as ResourceItem[]).filter((item) =>
                    item.name.toLowerCase().includes(query.toLowerCase())
                );
                setFilteredCollection(filtered);
            } else {
                setFilteredCollection([]);
            }
        } else {
            toast({
                title: "当前浏览器不支持IndexedDB",
                status: "error",
                duration: 2000,
            });
        }
    };
    
    
    

    const handleExternalSearch = (query: string, engine: "bing" | "google") => {
        const searchUrl =
            engine === "bing"
                ? `https://www.bing.com/search?q=${encodeURIComponent(query)}`
                : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        window.open(searchUrl, "_blank");
    };

    const my = {
        name: "我的",
        site: myCollection,
        icon: ""
    };

    const importMyCollection = () => {
        var elem = document.createElement("input");
        elem.setAttribute("type", "file");
        elem.addEventListener("change", (event: any) => {
            if (event.target.files.length !== 1) {
                console.log("No file selected");
            } else {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const my = JSON.parse(reader.result?.toString() as string);
                    getDb().then((db) => {
                        if (my instanceof Array) {
                            const writePromises: Promise<boolean>[] = [];
                            my.forEach((item) => {
                                writePromises.push(db.write(myCollectionTableName, item));
                            });
                            Promise.allSettled(writePromises).then(() => {
                                toast({
                                    title: "导入完成",
                                    status: "success",
                                    duration: 1000
                                });
                                updateMyCollection();
                            })
                        } else {
                            toast({
                                title: "导入失败, 文件格式错误",
                                status: "error",
                                duration: 2000
                            })
                        }
                    });
                };

                reader.readAsText(event.target.files[0]);
            }
        });

        elem.click();
    };

    const exportMyCollectionToLocal = () => {
        var blob = new Blob([JSON.stringify([myCollection], null, 2)], { type: "application/json;charset=utf-8" }).slice(2, -1);
        var url = URL.createObjectURL(blob);
        var elem = document.createElement("a");
        elem.href = url;
        elem.download = "我的收藏.json";
        elem.click();
    };

    return (
        <MyCollectionContext.Provider value={{ setMyCollection }}>
            <VStack
                bgColor="var(--main-bg-color)"
                alignItems="stretch"
                rowGap="30px"
                display="inline-flex"
                pos="relative"
            >
                {/* SearchBar Component */}
                <SearchBar
                    onLocalSearch={handleLocalSearch}
                    onExternalSearch={handleExternalSearch}
                />
                <HStack
                    pos="absolute"
                    right="10px"
                    top="70px"
                >
                    <Image
                        src="./add.svg"
                        w="22px"
                        cursor="pointer"
                        title="添加至我的"
                        onClick={() => setAddResourceModalOpen(true)}
                    />
                    <Image
                        src="./import.svg"
                        w="22px"
                        cursor="pointer"
                        title="导入"
                        onClick={importMyCollection}
                    />
                    <Image
                        src="./export.svg"
                        w="22px"
                        cursor="pointer"
                        title="导出"
                        onClick={exportMyCollectionToLocal}
                    />
                </HStack>
                {/* Resource Panels */}
                <ResourcePanel
                    key={my.name}
                    resource={my}
                    hasCollectBtn={false}
                    hasDeleteBtn
                    myCollection={myCollection}
                />
                {
                    resource.map((item) => (<ResourcePanel key={item.name} myCollection={myCollection} resource={item} hasDeleteBtn={false} hasCollectBtn />))
                }

                
            </VStack>
            <AddResourceDrawer open={addResourceModalOpen} close={() => setAddResourceModalOpen(false)} />
        </MyCollectionContext.Provider>
    )
};

export default Content;
