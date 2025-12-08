'use client'

import Container from "@/components/container/Container";
import Link from "next/link";

import styles from './page.module.css'
import {get} from '@/utils/request'
import ResourcesList from './resourcelist'
import {Resource} from '@/types/resources'

type CollectionNode = {
    _id: string
    name: string
    description?: string
    licence?: string
    children?: CollectionNode[]
}

export default async function Collection({params, searchParams}: {
    params: { slug: string },
    searchParams: Record<string, string | string[] | undefined>
}) {
    const slug = params.slug

    const pageSize = Array.isArray(searchParams.pageSize) ? searchParams.pageSize[0] : (searchParams.pageSize ?? '5')
    const desc = Array.isArray(searchParams.desc) ? searchParams.desc[0] : (searchParams.desc ?? 'true')

    const qs = `?pageSize=${encodeURIComponent(pageSize)}&desc=${encodeURIComponent(desc)}&}`

    const res = await get(`/collection/${slug}${qs}`)
    const data = res.response.data || {}

    const tree: CollectionNode | null = data.tree ?? null
    const resources: Resource[] = data.resources ?? []
    const hasMore: boolean = data.hasMore ?? false
    const lastResource: string | null = data.lastResource ?? null

    function renderChildren(node?: CollectionNode | null) {
        if (!node || !node.children || node.children.length === 0) return null
        return (
            <>
                <h2>Sub colecciones</h2>
                <ul className={styles['collections']}>
                    {node.children.map(child => (
                        <li key={child._id}>
                            <Link href={`/repositorio/coleccion/${child._id}`}
                                  className={styles['collection']}>{child.name}</Link>
                        </li>
                    ))}
                </ul>
            </>
        )
    }

    return (
        <>

            <Container id={"subcollections"}
                       crumb={[<Link key={'repositorio'} href={"/repositorio"}>Repositorio</Link>,
                           <Link key={'cols'} href={'/repositorio/colecciones'}>Colecciones</Link>,
                           <Link key={'col'} href={'#col'}>{tree?.name ?? 'Colección'}</Link>]}
            >

                <div className={styles['filtersBox']}>
                    <form method="get" className={styles['filters']}>
                        <div className={styles['field']}>
                            <label className={styles['label']}>Tamaño</label>
                            <select name="pageSize" defaultValue={pageSize} className={styles['select']}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>

                        <div className={styles['field']}>
                            <label className={styles['label']}>Orden</label>
                            <select name="desc" defaultValue={desc} className={styles['select']}>
                                <option value="true">Descendente</option>
                                <option value="false">Ascendente</option>
                            </select>
                        </div>

                        <div className={styles['fieldButton']}>
                            <button type="submit" className={styles['applyBtn']}>Aplicar</button>
                        </div>
                    </form>
                </div>

                <h1 className={styles['collection-box-title']}>{tree?.name ?? 'Colección'}</h1>
                {tree?.description && <p className={styles['collection-description']}>{tree.description}</p>}

                {renderChildren(tree)}

                <h2>Entradas recientes</h2>
                <ResourcesList
                    initialResources={resources}
                    initialHasMore={hasMore}
                    initialLastResource={lastResource}
                    slug={slug}
                    pageSize={Number(pageSize)}
                    desc={desc === 'true'}
                />

            </Container>
        </>
    )
}
