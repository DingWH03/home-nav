import siteJson from "./site.json";
import resourceJson from "./resource.json";

export interface Site {
    title: string;
    description: string;
    keywords: string[];
}

export interface ResourceItem {
    name: string;
    description?: string;
    url: string;
    image?: string;
}

export interface Resource {
    name: string;
    site: ResourceItem[];
    icon: string;
}

export const site = siteJson as Site;
export const resource = resourceJson as Resource[];

// 自动修改 image 为 site URL + "/favicon.ico"
function updateResourceImages(resources: Resource[]): Resource[] {
    for (const res of resources) {
        for (const item of res.site) {
            // 如果 image 为空，则设置为 site URL + "/favicon.ico"
            if (!item.image) {
                item.image = `${item.url}/favicon.ico`;
            }
        }
    }
    return resources;
}

// // 使用这个函数来更新资源
// const updatedResources = updateResourceImages(resource);
