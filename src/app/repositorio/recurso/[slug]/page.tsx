'use client'

import Container from "@/components/container/Container";
import Link from "next/link";
import {get} from "@/utils/request";
import styles from './page.module.css'
import {notFound} from "next/navigation";

type ResourceResponse = {
    dc: {
        title: [{ language: string, title: string }],
        creator: string,
        type: string,
        contributor?: { author?: string[], advisor?: string[] },
        date: { available: Date, issued: Date },
        description?: [{ language: string, abstract: string }],
        format: string,
        subject?: string[],
        publisher?: string,
        rights?: string,
    },
    access: {
        collection: string,
        restriction: number,
        hash: string,
        name: string
    },
    collectionInfo?: {
        current: {
            id: string,
            name: string,
        },
        ancestors: [{ id: string, name: string }]
    }
}

export default async function Resource({params}: { params: { slug: string } }) {
    const slug = await params.slug

    const request = await get('/resource/' + slug)
    if (request.response.status !== 200)
        return ''
    const resource = request.response.data as ResourceResponse

    const titleEs = resource.dc.title.find(title => title.language === 'es')?.title
    const descriptionEs = resource.dc.description?.find(d => d.language === 'es')?.abstract
    const issuedDate = resource.dc.date?.issued ? new Date(resource.dc.date.issued) : undefined
    const formattedDate = issuedDate ? issuedDate.toLocaleDateString('es-AR') : undefined
    const authors = resource.dc.contributor?.author?.length ? resource.dc.contributor.author.join(', ') : resource.dc.creator
    const fileHref = process.env.NEXT_PUBLIC_LORE_HOST + '/resource/' + slug + '/stream'
    const fileName = resource.access?.name ?? 'Ver recurso'
    const collectionId = resource.access?.collection ?? ''

    const collectionName = resource.collectionInfo?.current.name ?? 'Colección desconocida'
    const collectionCrumbs = resource.collectionInfo?.ancestors.reverse().map(ancestor => (
        <Link key={ancestor.id} href={'/repositorio/coleccion/' + ancestor.id}>{ancestor.name}</Link>
    )) ?? []

    return (
        <>
            <Container id={params.slug}
                       crumb={[<Link key={'repositorio'} href={'/repositorio'}>Repositorio</Link>,
                           <Link key={'cols'} href={'/repositorio/colecciones'}>Colecciones</Link>,
                           ...collectionCrumbs,
                           <Link key={'repo'} href={'/repositorio/coleccion/' + collectionId}>{collectionName}</Link>,
                           <Link key={'slug'} href={'#' + params.slug}>{titleEs}</Link>]}>
                <h1 className={styles['title']}>{titleEs}</h1>
                <div className={styles['resource-grid']}>
                    <aside className={styles['resource-info']}>
                        <div className={styles['resource-info__lead']}>
                            <p><strong>Ver</strong></p>
                            <Link className={styles['resource-info__button']} href={fileHref} target="_blank"
                                  rel="noopener noreferrer">{fileName}</Link>
                        </div>
                        <div>
                            <p><strong>Fecha</strong></p>
                            <p>{formattedDate ?? 'N/D'}</p>
                        </div>
                        <div>
                            <p><strong>Autor</strong></p>
                            <p>{authors ?? 'N/D'}</p>
                        </div>
                    </aside>

                    <div className={styles['resource-main'] + ' ' + styles['resource-main--box']}>
                        <h3 className={styles['resource-main__title']}>Descripción</h3>
                        <p>{descriptionEs ?? 'Sin descripción disponible.'}</p>
                        <div>
                            <p><strong>Identificador</strong></p>
                            <p>{slug}</p>
                        </div>
                        <div>
                            <p><strong>Colección</strong></p>
                            <Link className={styles['resource-info__button']}
                                  href={'/repositorio/coleccion/' + collectionId}
                                  rel="noopener noreferrer">{collectionName}</Link>
                        </div>
                    </div>
                </div>

            </Container>
        </>
    );
}