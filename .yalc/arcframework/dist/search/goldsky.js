"use strict";
// import { getGQLData } from '../gql';
// export async function search (
// 	term: string,
// 	poolId: string | null,
// 	owner: string | null,
// 	callback: (ids: string[], checkProcessed: any) => void
// ) {
// 	if (!poolId && !owner) {
// 		throw new Error('Must provide a pool id or owner for search');
// 	}
// 	if (poolId && owner) {
// 		throw new Error('Must provide either a pool id or owner for search, not both');
// 	}
// 	let tagsToSearch = ['Title', 'Description', 'Type', 'Artifact-Name', 'Artifact-Type', 'Keywords', 'File-Type'];
// 	let tags = [];
// 	if (poolId) {
// 		tags.push({
// 			name: 'Pool-Id',
// 			values: poolId,
// 		});
// 	} else if (owner) {
// 		tags.push({
// 			name: 'Initial-Owner',
// 			values: owner,
// 		});
// 	}
// 	for (let i = 0; i < tagsToSearch.length; i++) {
// 		let tag = tagsToSearch[i];
// 		let sendTags = [
// 			...tags,
// 			{
// 				name: tag,
// 				values: [`${term}`]
// 			},
// 		];
//         try {
//             let result = await getGQLData({
//                 ids: null,
//                 tagFilters: sendTags,
//                 uploader: null,
//                 cursor: null,
//                 reduxCursor: null,
//                 cursorObject: null,
// 				fuzzyMatch: true
//             });
// 			let allProcessed = i == (tagsToSearch.length - 1) ? true : false;
// 			let res = result.data.map((r: any) => {return r.node.id});
//             callback(res, allProcessed);
//         } catch (e: any) {
//             console.log(e);
//         }
// 	}
// }
